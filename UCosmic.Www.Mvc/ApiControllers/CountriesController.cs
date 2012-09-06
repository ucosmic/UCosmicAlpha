using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.UI;
using UCosmic.Domain.Places;

namespace UCosmic.Www.Mvc.ApiControllers
{
    public class CountriesController : ApiController
    {
        private readonly IQueryEntities _queryEntities;

        public CountriesController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [OutputCache(Duration = 3600, Location = OutputCacheLocation.Server)]
        public IEnumerable<SelectListItem> GetCountriesDropDown()
        {
            var countries = _queryEntities.Query<GeoNamesCountry>().Where(c => c.Code != null && c.Code != "").OrderBy(c => c.Name);
            var items = countries.Select(c => new SelectListItem
            {
                Text = c.Name,
                Value = c.Code,
            });
            return items.ToArray();
        } 
    }
}
