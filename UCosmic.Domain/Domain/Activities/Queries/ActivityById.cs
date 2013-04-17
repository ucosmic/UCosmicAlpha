using System;

namespace UCosmic.Domain.Activities
{
    public class ActivityById : BaseEntityQuery<Activity>, IDefineQuery<Activity>
    {
        public int Id { get; private set; }

        public ActivityById(int inEntityId)
        {
            Id = inEntityId;
        }
    }

    public class HandleActivityByIdQuery : IHandleQueries<ActivityById, Activity>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Activity Handle(ActivityById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .ById(query.Id)
            ;

            return result;
        }
    }
}
