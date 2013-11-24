using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.External
{
    public class OnUsfUserCreated : BaseEventHandler<UserCreated>
    {
        public override int? AsyncAfterMilliseconds { get { return 60 * 1000; } }
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<ImportUsfPerson> _commandHandler;
        private readonly ILogExceptions _exceptionLogger;
        private readonly ISendMail _mailSender;

        public OnUsfUserCreated(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<ImportUsfPerson> commandHandler
            , ILogExceptions exceptionLogger
            , ISendMail mailSender
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _commandHandler = commandHandler;
            _exceptionLogger = exceptionLogger;
            _mailSender = mailSender;
        }

        public override void Handle(UserCreated e)
        {
            // is this a usf user?
            var usf = _queryProcessor.Execute(new EstablishmentByUrl("www.usf.edu"));
            var tenant = _queryProcessor.Execute(new EstablishmentById(e.TenantId));
            if (tenant == null || usf == null || !usf.Equals(tenant)) return;

            var reportBuilder = new WorkReportBuilder("Handle USF User Created Event");
            var logging = UsfFacultyProfileAttribute.MailLog.ToString();
            try
            {
                // get the service integration
                var usfFacultyProfile = UsfFacultyProfileAttribute.UsfFacultyProfile.ToString();
                var integration = _entities.Get<ServiceIntegration>()
                    .EagerLoad(_entities, new Expression<Func<ServiceIntegration, object>>[]
                    {
                        x => x.StringAttributes,
                    })
                    .SingleOrDefault(x => x.TenantId == e.TenantId &&
                        x.Name.Equals(usfFacultyProfile));
                if (integration == null)
                    throw new InvalidOperationException(string.Format(
                        "Found no service integration for '{0}_{1}'.", usfFacultyProfile, e.TenantId));

                reportBuilder.Report("Wrapping integration data into USF Faculty Profile Service object.");
                var service = new UsfFacultyProfileService(integration);
                logging = service.Logging;

                reportBuilder.Report("Invoking command to import USF person data.");
                _commandHandler.Handle(new ImportUsfPerson(e.Principal, service, e.UserId)
                {
                    ReportBuilder = reportBuilder,
                });
            }
            catch (Exception ex)
            {
                reportBuilder.Report("");
                reportBuilder.Report("JOB FAILED!");
                reportBuilder.Report(ex.GetType().Name);
                reportBuilder.Report(ex.Message);
                reportBuilder.Report(ex.StackTrace);
                _exceptionLogger.Log(ex);
            }
            finally
            {
                _entities.DiscardChanges();
                var usfFacultyProfile = UsfFacultyProfileAttribute.UsfFacultyProfile.ToString();
                var integration = _entities.Get<ServiceIntegration>()
                    .EagerLoad(_entities, new Expression<Func<ServiceIntegration, object>>[]
                    {
                        x => x.StringAttributes,
                    })
                    .SingleOrDefault(x => x.TenantId == e.TenantId &&
                        x.Name.Equals(usfFacultyProfile));

                if (integration == null)
                {
                    reportBuilder.Report("Found no service integration for '{0}_{1}'.", usfFacultyProfile, e.TenantId);
                    reportBuilder.Send(_mailSender);
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(logging))
                    {
                        integration.LogEntries.Add(new ServiceLogEntry
                        {
                            IntegrationName = integration.Name,
                            TenantId = integration.TenantId,
                            Subject = reportBuilder.Subject,
                            Log = reportBuilder.Message.ToString(),
                        });
                        _entities.SaveChanges();
                    }
                    if (logging == UsfFacultyProfileAttribute.MailLog.ToString())
                    {
                        reportBuilder.Send(_mailSender);
                    }
                }
            }
        }
    }
}
