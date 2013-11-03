using System;

namespace UCosmic.Domain.Employees
{
    public class ProjectEmployeesPlacesViews : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.FromMinutes(10); } }
    }

    public class PerformProjectEmployeesPlacesViewsWork : IPerformWork<ProjectEmployeesPlacesViews>
    {
        private readonly EmployeesPlacesViewProjector _projector;

        public PerformProjectEmployeesPlacesViewsWork(EmployeesPlacesViewProjector projector)
        {
            _projector = projector;
        }

        public void Perform(ProjectEmployeesPlacesViews job)
        {
            _projector.Build();
        }
    }
}
