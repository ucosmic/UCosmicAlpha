using System;
using System.Security.Principal;

namespace UCosmic.Domain.Home
{
    public class HomeAlertById : BaseEntityQuery<HomeAlert>, IDefineQuery<HomeAlert>
    {
        public HomeAlertById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleHomeAlertByIdQuery : IHandleQueries<HomeAlertById, HomeAlert>
    {
        private readonly IQueryEntities _entities;

        public HandleHomeAlertByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public HomeAlert Handle(HomeAlertById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<HomeAlert>()
                .EagerLoad(_entities, query.EagerLoad)
                .ById(query.Id)
                //.SingleOrDefault(x => x.Id == query.Id)
            ;

            return result;
        }
    }
}
