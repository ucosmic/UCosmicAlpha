using System;
using System.Linq;

namespace UCosmic.Domain.Agreements
{
    public class MigrateUsfAgreementData : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformMigrateUsfAgreementDataWork : IPerformWork<MigrateUsfAgreementData>
    {
        private readonly ICommandEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;

        public PerformMigrateUsfAgreementDataWork(ICommandEntities entities
            , ISendMail mailSender
            , ILogExceptions exceptionLogger
        )
        {
            _entities = entities;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(MigrateUsfAgreementData job)
        {
            var reportBuilder = new WorkReportBuilder("Migrate USF Agreement Data");
            try
            {
                // for USF, move from description into content
                // do not preserve any titles as names.
                const int usfEstablishmentId = 3306;
                var usfAgreements = _entities.Get<Agreement>()
                    .Where(x => x.Participants.Any(y => y.IsOwner
                        &&
                        (
                            y.EstablishmentId == usfEstablishmentId
                            ||
                            y.Establishment.Ancestors.Any(z => z.AncestorId == usfEstablishmentId)
                        )
                    ))
                ;

                foreach (var usfAgreement in usfAgreements)
                {
                    var html = usfAgreement.Description.ToHtml();
                    usfAgreement.Name = null;
                    usfAgreement.Content = html;
                }
                _entities.SaveChanges();
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
                reportBuilder.Send(_mailSender);
            }
        }
    }
}
