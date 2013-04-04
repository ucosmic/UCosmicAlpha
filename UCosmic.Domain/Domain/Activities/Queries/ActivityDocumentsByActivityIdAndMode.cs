using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocumentsByActivityIdAndMode : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityDocument[]>
    {
        public int Id { get; private set; }
        public string ModeText { get; private set; }

        public ActivityDocumentsByActivityIdAndMode(int inActivityId, string inActivityModeText)
        {
            if (inActivityId == 0) throw new ArgumentNullException("inActivityId");

            Id = inActivityId;
            ModeText = inActivityModeText;
        }
    }

    public class HandleActivityDocumentsByActivityIdAndModeQuery : IHandleQueries<ActivityDocumentsByActivityIdAndMode, ActivityDocument[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityDocumentsByActivityIdAndModeQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityDocument[] Handle(ActivityDocumentsByActivityIdAndMode query)
        {
            if (query == null) throw new ArgumentNullException("query");

            ActivityDocument[] documents = new ActivityDocument[0];

            var values = _entities.Query<ActivityValues>()
                                    .FirstOrDefault(x => (x.ActivityId == query.Id) && (x.ModeText == query.ModeText));
            if (values != null)
            {
                documents = values.Documents.ToArray();
            }


            return documents;
        }
    }
}
