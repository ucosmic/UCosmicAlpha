using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class CountriesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public CountriesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [CacheHttpGet(Duration = 3600)]
        public IEnumerable<CountryApiModel> GetAll()
        {
            var entities = _queryProcessor.Execute(new Countries()
            {
                EagerLoad = new Expression<Func<Place, object>>[]
                {
                    x => x.GeoPlanetPlace, // this is where the country code comes from
                },
                OrderBy = new Dictionary<Expression<Func<Place, object>>, OrderByDirection>
                {
                    { x => x.OfficialName, OrderByDirection.Ascending },
                }
            });

            var items = Mapper.Map<CountryApiModel[]>(entities);
            return items.ToArray();
        } 
    }
}
