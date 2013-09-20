using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Activities;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsWithPeopleWithActivities : BaseEntitiesQuery<Establishment>, IDefineQuery<Establishment[]>
    {
        internal EstablishmentsWithPeopleWithActivities() { }

        internal bool? IsPublished { get; set; }
    }

    public class HandleEstablishmentsWithPeopleWithActivitiesQuery :
        IHandleQueries<EstablishmentsWithPeopleWithActivities, Establishment[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentsWithPeopleWithActivitiesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment[] Handle(EstablishmentsWithPeopleWithActivities query)
        {
            if (query == null) throw new ArgumentNullException("query");

            ICollection<Establishment> establishmentsWithPeopleWithActivities = new Collection<Establishment>();

            var activities = _entities.Query<Activity>();
            switch (query.IsPublished)
            {
                case true:
                    activities = activities.Published();
                    break;
                case false:
                    var publicText = ActivityMode.Public.AsSentenceFragment();
                    activities = activities.Where(x => x.ModeText != publicText && x.EditSourceId.HasValue);
                    break;
            }
            var peopleWithActivities = activities
                .Select(a => a.Person)
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations.Select(y => y.Establishment),
                    x => x.Affiliations.Select(y => y.Campus.Ancestors),
                    x => x.Affiliations.Select(y => y.College.Ancestors),
                })
                .Where(x => x.Affiliations.Any(y => y.IsDefault))
                .Distinct();

            /* Return people with activities default establishment and children of default */
            foreach (var person in peopleWithActivities)
            {
                var defaultAffiliation = person.Affiliations.Single(a => a.IsDefault);
                var defaultEstablishment = defaultAffiliation.Establishment;
                establishmentsWithPeopleWithActivities.Add(defaultEstablishment);

                foreach (var affiliation in person.Affiliations)
                {
                    if (affiliation.IsDefault) continue;

                    Establishment defaultChild = null;

                    if (affiliation.CampusId.HasValue)
                        defaultChild = affiliation.Campus;

                    else if (affiliation.CollegeId.HasValue)
                        defaultChild = affiliation.College;

                    if (defaultChild == null ||
                        defaultChild.Ancestors.All(x => x.AncestorId != defaultEstablishment.RevisionId) ||
                        establishmentsWithPeopleWithActivities.Contains(defaultChild))
                        continue;

                    if (!establishmentsWithPeopleWithActivities.Contains(defaultChild))
                        establishmentsWithPeopleWithActivities.Add(defaultChild);
                }
            }

            return establishmentsWithPeopleWithActivities.Distinct().ToArray();
        }
    }
}
