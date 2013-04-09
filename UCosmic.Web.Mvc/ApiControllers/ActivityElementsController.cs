using System.Collections.Generic;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api")]
    public class ActivityElementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public ActivityElementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity locations
        */
        // --------------------------------------------------------------------------------
        [GET("activity-locations")]
        public ICollection<ActivityLocationNameApiModel> GetActivityLocations()
        {
            var activityPlaces = _queryProcessor.Execute(new FilteredPlaces
            {
                IsCountry = true,
                //IsBodyOfWater = true,
                IsEarth = true
            });

            var model = Mapper.Map<ActivityLocationNameApiModel[]>(activityPlaces);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all establishments by keyword
        */
        // --------------------------------------------------------------------------------
        [GET("activity-establishments")]
        public IEnumerable<ActivityEstablishmentApiModel> GetActivityInstitutions(string keyword)
        {
            var pagedEstablishments = _queryProcessor.Execute(new EstablishmentViewsByKeyword
            {
                Keyword = keyword,
                PageSize = int.MaxValue,
                PageNumber = 1
            });

            var model = Mapper.Map<IEnumerable<EstablishmentView>, IEnumerable<ActivityEstablishmentApiModel>>(pagedEstablishments.Items);
            return model;
        }
    }
}
