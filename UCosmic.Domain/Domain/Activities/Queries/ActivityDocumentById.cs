using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocumentById : BaseEntityQuery<ActivityDocument>, IDefineQuery<ActivityDocument>
    {
        public int id;

        public ActivityDocumentById(int inId)
        {
            if (inId == 0) throw new ArgumentNullException("inId");
            id = inId;
        }
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

            var result = _entities.Query<ActivityDocument>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.id)
            ;

            return result;
        }
    }
}
