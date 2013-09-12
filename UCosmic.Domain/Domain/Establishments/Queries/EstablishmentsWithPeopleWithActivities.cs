using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsWithPeopleWithActivities : BaseEntitiesQuery<EstablishmentCategory>,
                                                          IDefineQuery<IQueryable<Establishment>>
    {
    }

    public class HandleEstablishmentsWithPeopleWithActivitiesQuery :
        IHandleQueries<EstablishmentsWithPeopleWithActivities, IQueryable<Establishment>>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentsWithPeopleWithActivitiesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<Establishment> Handle(EstablishmentsWithPeopleWithActivities query)
        {
            if (query == null) throw new ArgumentNullException("query");

            ICollection<Establishment> establishmentsWithPeopleWithActivities = new Collection<Establishment>();

            var peopleWithActivities = _entities.Query<Activity>()
                                                .Select(a => a.Person)
                                                .Distinct();

            /* Return people with activities default establishment and children of default */
            foreach (var person in peopleWithActivities)
            {
                var defaultAffiliation = person.Affiliations.SingleOrDefault(a => a.IsDefault);
                if (defaultAffiliation != null)
                {
                    var defaultEstablishment = defaultAffiliation.Establishment; 
                    establishmentsWithPeopleWithActivities.Add(defaultEstablishment);

                    foreach (var affiliation in person.Affiliations)
                    {
                        if (!affiliation.IsDefault)
                        {
                            int? defaultChildId = null;
                            
                            if (affiliation.CampusId.HasValue)
                            {
                                defaultChildId = affiliation.CampusId.Value;
                            }
                            else if (affiliation.CollegeId.HasValue)
                            {
                                defaultChildId = affiliation.CollegeId.Value; 
                            }

                            if (defaultChildId.HasValue)
                            {
                                var defaultChild = _entities.Query<Establishment>().SingleOrDefault(e => e.RevisionId == defaultChildId);

                                if ((defaultChild != null) &&
                                    (defaultChild.Parent != null) &&
                                    (defaultChild.Parent.RevisionId == defaultEstablishment.RevisionId))
                                {
                                    if (!establishmentsWithPeopleWithActivities.Contains(defaultChild))
                                    {
                                        establishmentsWithPeopleWithActivities.Add(defaultChild);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return new EnumerableQuery<Establishment>(establishmentsWithPeopleWithActivities);
        }
    }
}
