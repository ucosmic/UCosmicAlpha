using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Web.Http;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        //[CacheHttpGet(Duration = 60)]
        //public PageOf<EstablishmentApiModel> Get(string keyword = null, string country = null, string orderBy = null, int PageSize = 10, int pageNumber = 1)
        public PageOf<EstablishmentApiModel> Get([FromUri] EstablishmentSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new EstablishmentsByKeyword
            {
                CountryCode = input.Country,
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    e => e.Names,
                },
                OrderBy = new Dictionary<Expression<Func<Establishment, object>>, OrderByDirection>
                {
                    { e => e.RevisionId, OrderByDirection.Ascending },
                },
                Pager = new PagedQueryRequest
                {
                    PageNumber = input.PageNumber,
                    PageSize = input.PageSize,
                },
            };
            var results = _queryProcessor.Execute(query);

            var model = new PageOf<EstablishmentApiModel>(results.PageSize, results.PageNumber, results.ItemTotal)
            {
                Items = results.Items.Select(x => new EstablishmentApiModel
                {
                    RevisionId = x.RevisionId,
                    OfficialName = x.OfficialName,
                    WebsiteUrl = x.WebsiteUrl,
                }),
            };

            //var entities = _queryEntities
            //    .Query<Establishment>()
            //;

            //var model = new PageOf<EstablishmentApiModel>(input.PageSize, input.PageNumber, entities.Count());

            //if (model.PageCount < 1) return model;
            //if (model.IsOutOfBounds)
            //{
            //    input.PageNumber = model.PageCount;
            //    return Get(input);
            //}

            //entities = entities
            //    .OrderBy(e => e.RevisionId)
            //    .Skip(input.PageSize * (input.PageNumber - 1))
            //    .Take(input.PageSize)
            //;

            //model.Items = entities.Select(e => new EstablishmentApiModel
            //{
            //    RevisionId = e.RevisionId,
            //    OfficialName = e.OfficialName,
            //    WebsiteUrl = e.WebsiteUrl,
            //});

            return model;

            //return null;
        }
    }
}
