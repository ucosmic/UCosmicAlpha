using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByPersonId : BaseEntitiesQuery<ActivityValues>, IDefineQuery<IQueryable<ActivityValues>>
    {
        public ActivitiesByPersonId(IPrincipal principal, int personId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int PersonId { get; private set; }
    }

    public class HandleActivitiesByPersonIdQuery : IHandleQueries<ActivitiesByPersonId, IQueryable<ActivityValues>>
    {
        private readonly IQueryEntities _entities;

        public HandleActivitiesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<ActivityValues> Handle(ActivitiesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var publicText = ActivityMode.Public.AsSentenceFragment();
            var result = _entities.Query<ActivityValues>()
                //.EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Activity.PersonId == query.PersonId && x.ModeText == publicText && x.Activity.ModeText == publicText && x.Activity.Original == null)
            ;
            return result;
        }
    }
}
