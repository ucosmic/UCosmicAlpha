using System;
using System.Security.Principal;

namespace UCosmic.Domain.Home
{
    public class HomeSectionById : BaseEntityQuery<HomeSection>, IDefineQuery<HomeSection>
    {
        public HomeSectionById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleHomeSectionByIdQuery : IHandleQueries<HomeSectionById, HomeSection>
    {
        private readonly IQueryEntities _entities;

        public HandleHomeSectionByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public HomeSection Handle(HomeSectionById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<HomeSection>()
                .EagerLoad(_entities, query.EagerLoad)
                .ById(query.Id)
            ;

            return result;
        }
    }
}
