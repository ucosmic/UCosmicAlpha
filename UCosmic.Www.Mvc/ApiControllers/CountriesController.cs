using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using UCosmic.Cache;
using UCosmic.Domain.Places;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    public class CountriesController : ApiController
    {
        private readonly IQueryEntities _queryEntities;

        public CountriesController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [CacheHttpGet(Duration = 60)]
        public IEnumerable<CountryApiModel> Get()
        {
            var countries = _queryEntities
                //.Query<GeoNamesCountry>()
                //.Where(c => c.Code != null && c.Code != "")
                //.OrderBy(c => c.Name)
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
