using System;
using System.Linq;
using System.Security.Principal;
//using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class PublicActivityById : BaseEntityQuery<ActivityValues>, IDefineQuery<ActivityValues>
    {
        public PublicActivityById(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
    }

    public class HandlePublicActivityByIdQuery : IHandleQueries<PublicActivityById, ActivityValues>
    {
        private readonly IQueryEntities _entities;

        public HandlePublicActivityByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityValues Handle(PublicActivityById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var publicText = ActivityMode.Public.AsSentenceFragment();
            var result = _entities.Query<ActivityValues>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.ActivityId == query.ActivityId && x.ModeText == publicText && x.Activity.ModeText == publicText)
            ;
            return result;
        }
    }
}
