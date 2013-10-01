using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityPlacesByActivityId : BaseEntitiesQuery<ActivityLocation>, IDefineQuery<ActivityLocation[]>
    {
        public ActivityPlacesByActivityId(int activityId)
        {
            ActivityId = activityId;
        }

        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
    }

    public class HandleActivityPlacesByActivityIdQuery : IHandleQueries<ActivityPlacesByActivityId, ActivityLocation[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityPlacesByActivityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityLocation[] Handle(ActivityPlacesByActivityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityLocation>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.ActivityValues.ActivityId == query.ActivityId)
            ;

            // when mode is not requested, assume same mode as activity
            if (!query.Mode.HasValue)
            {
                queryable = queryable.Where(x => x.ActivityValues.ModeText == x.ActivityValues.Activity.ModeText);
            }
            else
            {
                var modeText = query.Mode.Value.AsSentenceFragment();
                queryable = queryable.Where(x => x.ActivityValues.ModeText == modeText);
            }

            queryable = queryable.OrderBy(query.OrderBy);

            return queryable.ToArray();
        }
    }
}
