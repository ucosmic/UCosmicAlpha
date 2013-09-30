using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocumentById : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityDocument>
    {
        public ActivityDocumentById(int activityId, int documentId)
            : this(documentId)
        {
            ActivityId = activityId;
        }

        internal ActivityDocumentById(int documentId)
        {
            DocumentId = documentId;
        }

        public int ActivityId { get; private set; }
        public int DocumentId { get; private set; }
    }

    public class HandleActivityDocumentByEntityIdQuery : IHandleQueries<ActivityDocumentById, ActivityDocument>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityDocumentByEntityIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ActivityDocument Handle(ActivityDocumentById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityDocument>()
                .EagerLoad(_entities, query.EagerLoad)
            ;
            if (query.ActivityId != 0)
                queryable = queryable.Where(x => x.ActivityValues.ActivityId == query.ActivityId);

            var result = queryable.SingleOrDefault(x => x.RevisionId == query.DocumentId);

            return result;
        }
    }
}
