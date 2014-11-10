using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Home
{
    public class HomeSectionByEstablishmentId : BaseEntityQuery<HomeSection>, IDefineQuery<HomeSection[]>
    {
        public HomeSectionByEstablishmentId(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public int EstablishmentId { get; private set; }
    }

    public class HandleHomeSectionByEstablishmentIdQuery : IHandleQueries<HomeSectionByEstablishmentId, HomeSection[]>
    {
        private readonly IQueryEntities _entities;

        public HandleHomeSectionByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public HomeSection[] Handle(HomeSectionByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");
            IQueryable<HomeSection> results = _entities.Query<HomeSection>()
                                                             .Where(a => a.EstablishmentId == query.EstablishmentId);

            return results.ToArray();
        }
    }

}
