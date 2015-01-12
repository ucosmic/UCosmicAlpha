using System;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class ProjectEmployeeSummaryViews : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.FromMinutes(10); } }
    }

    public class PerformProjectEmployeeSummaryViewsWork : IPerformWork<ProjectEmployeeSummaryViews>
    {
        private readonly EmployeePlacesViewBuilder _placesBuilder;
        private readonly EmployeePlacesViewProjector _placesProjector;
        private readonly EmployeeActivityCountsViewBuilder _activityCountsBuilder;
        //private readonly EmployeeActivityCountsViewProjector _activityCountsProjector;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;
        private static bool _mailSent;

        public PerformProjectEmployeeSummaryViewsWork(EmployeePlacesViewBuilder placesBuilder
            , EmployeePlacesViewProjector placesProjector
            , EmployeeActivityCountsViewBuilder activityCountsBuilder
            , EmployeeActivityCountsViewProjector activityCountsProjector, ISendMail mailSender, ILogExceptions exceptionLogger)
        {
            _placesBuilder = placesBuilder;
            _placesProjector = placesProjector;
            _activityCountsBuilder = activityCountsBuilder;
            //_activityCountsProjector = activityCountsProjector;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(ProjectEmployeeSummaryViews job)
        {
            var reportBuilder = new WorkReportBuilder("Cook Activity Data");
            try
            {
                reportBuilder.Report("Getting relevant tenants.");
                var establishmentIds = _placesBuilder.GetEstablishmentIdsWithData().ToArray();
                reportBuilder.Report("Operating on {0} tenants.", establishmentIds.Length);
                foreach (var establishmentId in establishmentIds)
                {
                    var placesViews = _placesBuilder.Build(establishmentId);
                    //var activityCountView = _activityCountsBuilder.Build(establishmentId);
                    reportBuilder.Report("Places view has {0} records., projecting...", placesViews.Length);
                    _placesProjector.Set(placesViews, establishmentId);
                    reportBuilder.Report("Places projected into view manager for establishment #{0}.", establishmentId);
                    //_activityCountsProjector.Set(activityCountView, establishmentId);
                }
                reportBuilder.Report("Activity data cooked.");
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
