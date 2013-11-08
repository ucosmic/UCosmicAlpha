using System;
using System.Diagnostics;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class CreateVerticalAffiliations : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.FromMilliseconds(int.MaxValue); } }
    }

    public class PerformCreateVerticalAffiliationsWork : IPerformWork<CreateVerticalAffiliations>
    {
        private readonly ICommandEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;
        private static bool _mailSent;

        public PerformCreateVerticalAffiliationsWork(ICommandEntities entities, ISendMail mailSender, ILogExceptions exceptionLogger)
        {
            _entities = entities;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(CreateVerticalAffiliations job)
        {
            var reportBuilder = new WorkReportBuilder("Create Vertical Affiliations");
            try
            {
                // get all horizontal affiliations from the database
                var horizontals = _entities.Query<Affiliation>().Where(x => x.DepartmentId.HasValue)
                    .OrderBy(x => x.PersonId)
                    .ToArray();

                // double check to make sure none of these are default affiliations
                if (horizontals.Any(x => x.IsDefault))
                    throw new InvalidOperationException("Found unexpected default horizontal affiliation.");

                // create a vertical affiliation for each horizontal one
                var saveChanges = false;
                foreach (var horizontal in horizontals)
                {
                    // make sure we don't already have a vertical
                    var vertical = _entities.Query<Affiliation>()
                        .SingleOrDefault(x => x.EstablishmentId == horizontal.DepartmentId.Value && x.PersonId == horizontal.PersonId);
                    if (vertical != null) continue;

                    Debug.Assert(horizontal.DepartmentId != null);
                    vertical = new Affiliation
                    {
                        EstablishmentId = horizontal.DepartmentId.Value,
                        PersonId = horizontal.PersonId,
                        FacultyRankId = horizontal.FacultyRankId,
                        JobTitles = horizontal.JobTitles,
                        IsAcknowledged = horizontal.IsAcknowledged,
                        IsClaimingStudent = horizontal.IsClaimingStudent,
                        IsClaimingAdministrator = horizontal.IsClaimingAdministrator,
                        IsClaimingEmployee = horizontal.IsClaimingEmployee,
                        IsClaimingFaculty = horizontal.IsClaimingFaculty,
                        IsClaimingInternationalOffice = horizontal.IsClaimingInternationalOffice,
                        IsClaimingStaff = horizontal.IsClaimingStaff,
                        IsDefault = false,
                    };
                    _entities.Create(vertical);
                    saveChanges = true;
                }

                if (saveChanges) _entities.SaveChanges();
            }
            catch (Exception ex)
            {
                reportBuilder.Report("");
                reportBuilder.Report("JOB FAILED!");
                reportBuilder.Report(ex.GetType().Name);
                reportBuilder.Report(ex.Message);
                reportBuilder.Report(ex.StackTrace);
                _exceptionLogger.Log(ex);
                if (!_mailSent)
                    reportBuilder.Send(_mailSender);
                _mailSent = true;
            }
            //finally // do not want to receive emails indicating success every 10 minutes
            //{
            //    if (!_mailSent)
            //        reportBuilder.Send(_mailSender);
            //    _mailSent = true;
            //}
        }
    }
}
