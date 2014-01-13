using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/places")]
    public class PlaceNamesController : ApiController
    {
        private readonly IProcessQueries _queries;

        public PlaceNamesController(IProcessQueries queries)
        {
            _queries = queries;
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("names/autocomplete")]
        public IEnumerable<PlaceNameAutoCompleteModel> GetAutoComplete([FromUri] AutoCompleteNameInputModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Terms)) return Enumerable.Empty<PlaceNameAutoCompleteModel>();
            var query = new AutoCompletePlaceName
            {
                Terms = model.Terms,
                MaxResults = model.MaxResults,
                Granularity = model.Granularity,
            };
            var documents = _queries.Execute(query);
            var models = Mapper.Map<PlaceNameAutoCompleteModel[]>(documents);
            return models;
        }
    }
}