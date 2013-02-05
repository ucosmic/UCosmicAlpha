using System;

namespace UCosmic.Domain.Activities
{
    public class ActivityByEntityId : BaseEntityQuery<Activity>, IDefineQuery<Activity>
    {
        public Guid EntityId { get; set; }
    }

    public class HandleActivityByEntityIdQuery : IHandleQueries<ActivityByEntityId, Activity>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityByEntityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Activity Handle(ActivityByEntityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByEntityId(query.EntityId)
            ;

            return result;
        }
    }
}
