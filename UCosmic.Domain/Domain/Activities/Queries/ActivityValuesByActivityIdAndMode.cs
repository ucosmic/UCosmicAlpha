using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityValuesByActivityIdAndMode : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityValues>
    {
        public int Id { get; private set; }
        public string ModeText { get; private set; }

        public ActivityValuesByActivityIdAndMode(int inActivityId, string inActivityModeText)
        {
            if (inActivityId == 0) throw new ArgumentNullException("inActivityId");

            Id = inActivityId;
            ModeText = inActivityModeText;
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
                                    .FirstOrDefault(x => (x.ActivityId == query.Id) && (x.ModeText == query.ModeText));

            return values;
        }
    }
}
