using System;

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
        private readonly EmployeeActivityCountsViewProjector _activityCountsProjector;

        public PerformProjectEmployeeSummaryViewsWork(EmployeePlacesViewBuilder placesBuilder
            , EmployeePlacesViewProjector placesProjector
            , EmployeeActivityCountsViewBuilder activityCountsBuilder
            , EmployeeActivityCountsViewProjector activityCountsProjector
        )
        {
            _placesBuilder = placesBuilder;
            _placesProjector = placesProjector;
            _activityCountsBuilder = activityCountsBuilder;
            _activityCountsProjector = activityCountsProjector;
        }

        public void Perform(ProjectEmployeeSummaryViews job)
        {
            var establishmentIds = _placesBuilder.GetEstablishmentIdsWithData();
            foreach (var establishmentId in establishmentIds)
            {
                var placesViews = _placesBuilder.Build(establishmentId);
                var activityCountView = _activityCountsBuilder.Build(establishmentId);
                _placesProjector.Set(placesViews, establishmentId);
                _activityCountsProjector.Set(activityCountView, establishmentId);
            }
        }
    }
}
