using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityValuesByActivityIdAndMode : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityValues>
    {
        public int ActivityId { get; private set; }
        public string ModeText { get; private set; }
        public ActivityMode Mode { get; private set; }

        public ActivityValuesByActivityIdAndMode(int activityId, string modeText)
        {
            if (activityId == 0) throw new ArgumentNullException("activityId");

            ActivityId = activityId;
            ModeText = modeText;
            Mode = modeText.AsEnum<ActivityMode>();
        }

        public ActivityValuesByActivityIdAndMode(int activityId, ActivityMode mode)
        {
            if (activityId == 0) throw new ArgumentNullException("activityId");

            ActivityId = activityId;
            Mode = mode;
            ModeText = mode.AsSentenceFragment();
        }
    }

    public class HandleActivityValuesByActivityIdAndModeQuery : IHandleQueries<ActivityValuesByActivityIdAndMode, ActivityValues>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityValuesByActivityIdAndModeQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityValues Handle(ActivityValuesByActivityIdAndMode query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var values = _entities.Query<ActivityValues>()
                .FirstOrDefault(x => x.ActivityId == query.ActivityId && x.ModeText == query.ModeText);

            return values;
        }
    }
}
