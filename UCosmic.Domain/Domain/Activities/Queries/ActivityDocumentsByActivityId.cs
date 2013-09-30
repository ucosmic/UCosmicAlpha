using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocumentsByActivityId : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityDocument[]>
    {
        public ActivityDocumentsByActivityId(int activityId)
        {
            ActivityId = activityId;
        }

        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
    }

    public class HandleActivityDocumentsByActivityIdQuery : IHandleQueries<ActivityDocumentsByActivityId, ActivityDocument[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityDocumentsByActivityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityDocument[] Handle(ActivityDocumentsByActivityId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // assume public when mode is not passed
            var mode = query.Mode.HasValue ? query.Mode.Value : ActivityMode.Public;
            var modeText = mode.AsSentenceFragment();
            var values = _entities.Query<ActivityValues>()
                .FirstOrDefault(x => x.ActivityId == query.ActivityId && x.ModeText == modeText);
            return values != null ? values.Documents.ToArray() : new ActivityDocument[0];
        }
    }
}
