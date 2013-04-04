using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocumentsByValuesId : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityDocument[]>
    {
        public int ValuesId { get; private set; }

        public ActivityDocumentsByValuesId(int inValuesId)
        {
            if (inValuesId == 0) throw new ArgumentNullException("inValuesId");
            ValuesId = inValuesId;
        }
    }

    public class HandleActivityDocumentsByValuesIdQuery : IHandleQueries<ActivityDocumentsByValuesId, ActivityDocument[]>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityDocumentsByValuesIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityDocument[] Handle(ActivityDocumentsByValuesId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<ActivityDocument>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.ActivityValuesId == query.ValuesId)
            ;

            return result.ToArray();
        }
    }
}
