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
            HomeAlert results = _entities.Query<HomeAlert>()
                    .FirstOrDefault(a => a.EstablishmentId == query.EstablishmentId);

            return results;
        }
    }

}
