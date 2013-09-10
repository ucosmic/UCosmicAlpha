using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsWithPeopleWithActivities : BaseEntitiesQuery<EstablishmentCategory>, IDefineQuery<IQueryable<Establishment>>
    {
    }

    public class HandleEstablishmentsWithPeopleWithActivitiesQuery : IHandleQueries<EstablishmentsWithPeopleWithActivities, IQueryable<Establishment>>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentsWithPeopleWithActivitiesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<Establishment> Handle(EstablishmentsWithPeopleWithActivities query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var peopleWithActivities = _entities.Query<Activity>()
                                                .Select(a => a.Person)
                                                .Distinct();

            var affiliationsWithPeopleWithActivities = peopleWithActivities
                .SelectMany(p => p.Affiliations.Where(a => a.IsDefault))
                .Distinct();

            var establishmentsWithPeopleWithActivities = affiliationsWithPeopleWithActivities
                .Select(a => a.Establishment)
                .Distinct();
                
            return establishmentsWithPeopleWithActivities;
        }
    }
}
