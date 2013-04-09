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
         * Get all establishment institutions (category code 'INST')
        */
        // --------------------------------------------------------------------------------
        [GET("activity-institutions")]
        public ICollection<ActivityInstitutionApiModel> GetActivityInstitutions()
        {
            var institutions = _queryProcessor.Execute(new EstablishmentsByType("INST"));

            var model = Mapper.Map<ICollection<Establishment>, ICollection<ActivityInstitutionApiModel>>(institutions);
            return model;
        }
    }
}
