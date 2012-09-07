using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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

        //[CacheHttpGet(Duration = 3600)]
        public IEnumerable<EstablishmentApiModel> Get(string keyword = null, string country = null, string orderBy = null, int pageSize = 10, int pageNumber = 1)
        {
            if (pageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var entities = _queryEntities
                .Query<Establishment>()
            ;
            var entitiesCount = entities.Count();
            var pageCount = (int)Math.Ceiling((double)entitiesCount / pageSize);
            if (pageCount < 1) return Enumerable.Empty<EstablishmentApiModel>();
            if (pageNumber > pageCount) return Get(keyword, country, orderBy, pageSize, pageCount);

            entities = entities
                .OrderBy(e => e.RevisionId)
                .Skip(pageSize * (pageNumber - 1))
                .Take(pageSize)
            ;

            var items = entities.Select(e => new EstablishmentApiModel
            {
                RevisionId = e.RevisionId,
                OfficialName = e.OfficialName,
                WebsiteUrl = e.WebsiteUrl,
            });

            return items;
        }
    }
}
