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
        public PageOf<EstablishmentView> Get([FromUri] EstablishmentSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new EstablishmentsByKeyword
            {
                CountryCode = input.Country,
                OrderBy = new Dictionary<Expression<Func<EstablishmentView, object>>, OrderByDirection>
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

            var model = new PageOf<EstablishmentView>(results.PageSize, results.PageNumber, results.ItemTotal)
            {
                //Items = results.Items.Select(x => new EstablishmentView
                //{
                //    RevisionId = x.RevisionId,
                //    OfficialName = x.OfficialName,
                //    WebsiteUrl = x.WebsiteUrl,
                //}),
                Items = results.Items,
            };

            return model;
        }
    }
}
