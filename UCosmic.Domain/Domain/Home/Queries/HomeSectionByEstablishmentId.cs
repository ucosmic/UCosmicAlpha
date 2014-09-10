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

            //var result = _entities.Query<HomeSection>()
            //    .EagerLoad(_entities, query.EagerLoad)
            //    .ByEstablishmentId(query.EstablishmentId)
            //    //.SingleOrDefault(x => x.Id == query.Id)
            //;
            IQueryable<HomeSection> results = _entities.Query<HomeSection>()
                                                             .Where(a => a.EstablishmentId == query.EstablishmentId);
                                                             //.OrderBy(a => (a.LanguageId != null) ?
                                                             //    a.Language.Names.FirstOrDefault().Text :
                                                             //    a.Other);

            return results.ToArray();
        }
    }

}
