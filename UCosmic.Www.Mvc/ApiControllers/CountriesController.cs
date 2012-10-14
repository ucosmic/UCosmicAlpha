using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using UCosmic.Domain.Places;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class CountriesController : ApiController
    {
        private readonly IQueryEntities _queryEntities;

        public CountriesController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [CacheHttpGet(Duration = 3600)]
        public IEnumerable<CountryApiModel> GetAll()
        {
            var countries = _queryEntities
                .Query<Place>()
                .Where(p => p.IsCountry)
                .OrderBy(p => p.OfficialName)
            ;
            var items = countries.Select(c => new CountryApiModel
            {
                Name = c.OfficialName,
                Code = c.GeoPlanetPlace.Country.Code,
            });
            return items.ToArray();
        } 
    }
}
