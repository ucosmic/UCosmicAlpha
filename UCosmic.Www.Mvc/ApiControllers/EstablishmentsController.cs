using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    public class EstablishmentsController : ApiController
    {
        private readonly IQueryEntities _queryEntities;

        public EstablishmentsController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [CacheHttpGet(Duration = 3600)]
        public IEnumerable<EstablishmentApiModel> Get()
        {
            var establishments = _queryEntities
                .Query<Establishment>()
            ;

            var items = establishments.Select(e => new EstablishmentApiModel
            {
                OfficialName = e.OfficialName,
                WebsiteUrl = e.WebsiteUrl,
            });

            return items.ToArray();
        } 
    }
}
