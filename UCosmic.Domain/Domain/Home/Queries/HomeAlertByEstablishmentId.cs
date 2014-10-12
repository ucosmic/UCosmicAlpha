using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Home
{
    public class HomeAlertByEstablishmentId : BaseEntityQuery<HomeAlert>, IDefineQuery<HomeAlert>
    {
        public HomeAlertByEstablishmentId(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public int EstablishmentId { get; private set; }
    }

    public class HandleHomeAlertByEstablishmentIdQuery : IHandleQueries<HomeAlertByEstablishmentId, HomeAlert>
    {
        private readonly IQueryEntities _entities;

        public HandleHomeAlertByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public HomeAlert Handle(HomeAlertByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            //var result = _entities.Query<HomeAlert>()
            //    .EagerLoad(_entities, query.EagerLoad)
            //    .ByEstablishmentId(query.EstablishmentId)
            //    //.SingleOrDefault(x => x.Id == query.Id)
            //;
            HomeAlert results = _entities.Query<HomeAlert>()
                                                             .FirstOrDefault(a => a.EstablishmentId == query.EstablishmentId);
                                                             //.OrderBy(a => (a.LanguageId != null) ?
                                                             //    a.Language.Names.FirstOrDefault().Text :
                                                             //    a.Other);

            return results;
        }
    }

}
