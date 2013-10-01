using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityTagsByActivityId : BaseEntitiesQuery<ActivityTag>, IDefineQuery<ActivityTag[]>
    {
        public ActivityTagsByActivityId(int activityId)
        {
            ActivityId = activityId;
        }

        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
    }

    public class HandleActivityTagsByActivityIdQuery : IHandleQueries<ActivityTagsByActivityId, ActivityTag[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityTagsByActivityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityTag[] Handle(ActivityTagsByActivityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityTag>()
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
