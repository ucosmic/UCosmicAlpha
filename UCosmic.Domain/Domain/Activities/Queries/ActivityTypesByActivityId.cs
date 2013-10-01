using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityTypesByActivityId : BaseEntitiesQuery<ActivityType>, IDefineQuery<ActivityType[]>
    {
        public ActivityTypesByActivityId(int activityId)
        {
            ActivityId = activityId;
        }

        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
    }

    public class HandleActivityTypesByActivityIdQuery : IHandleQueries<ActivityTypesByActivityId, ActivityType[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityTypesByActivityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityType[] Handle(ActivityTypesByActivityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityType>()
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
