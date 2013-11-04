using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.Employees
{
    public class EmployeeActivityCountsViewBuilder
    {
        private readonly IQueryEntities _entities;

        public EmployeeActivityCountsViewBuilder(IQueryEntities entities)
        {
            _entities = entities;
        }

        internal EmployeeActivityCountsView Build(int establishmentId)
        {
            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var activities = _entities.Query<Activity>()
                .Where(x =>
                    x.Original == null && x.ModeText == publishedText && // published, non-work-copy
                    x.Person.Affiliations.Any(y => y.IsDefault) // make sure person's default affiliation is not null
                    &&
                    (   // person's default affiliation is with or underneath the tenant domain being queried
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId == establishmentId
                        ||
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment.Ancestors.Any(y => y.AncestorId == establishmentId)
                    )
                )
                .Select(x => x.Values.FirstOrDefault(y => y.ModeText == publishedText))
            ;

            var view = new EmployeeActivityCountsView
            {
                EstablishmentId = establishmentId,
                ActivityCount = activities.Count(),
                PersonCount = activities.Select(x => x.Activity.PersonId).Distinct().Count(),
                LocationCount = activities.SelectMany(x => x.Locations).Select(x => x.PlaceId).Distinct().Count(),
            };

            return view;
        }
    }
}