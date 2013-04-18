using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityByEditSourceId : BaseEntityQuery<Activity>, IDefineQuery<Activity>
    {
        public int Id { get; private set; }

        public ActivityByEditSourceId(int inId)
        {
            Id = inId;
        }
    }

    public class HandleActivityByEditSourceIdQuery : IHandleQueries<ActivityByEditSourceId, Activity>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityByEditSourceIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Activity Handle(ActivityByEditSourceId query)
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
