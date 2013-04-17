using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityByEditSourceEntityId : BaseEntityQuery<Activity>, IDefineQuery<Activity>
    {
        public int Id { get; private set; }

        public ActivityByEditSourceEntityId(int inId)
        {
            Id = inId;
        }
    }

    public class HandleActivityByEditSourceEntityIdQuery : IHandleQueries<ActivityByEditSourceEntityId, Activity>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityByEditSourceEntityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Activity Handle(ActivityByEditSourceEntityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault( x => x.EditSourceId == query.Id)
            ;

            return result;
        }
    }
}
