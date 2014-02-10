using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities")]
    public class ActivityPlacesController : ApiController
    {
        private const string PluralUrl = "{activityId:int}/places";
        private const string SingleUrl = "{activityId:int}/places/{placeId:int}";
        private const string OptionsUrl = "places";

        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateActivityPlace> _createHandler;
        private readonly IHandleCommands<PurgeActivityPlace> _purgeHandler;

        public ActivityPlacesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateActivityPlace> createHandler
            , IHandleCommands<PurgeActivityPlace> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [GET(PluralUrl)]
        public IEnumerable<ActivityPlaceApiModel> Get(int activityId)
        {
            var entities = _queryProcessor.Execute(new ActivityPlacesByActivityId(activityId)
            {
                EagerLoad = ActivityPlaceApiModel.EagerLoad,
            });
            var models = Mapper.Map<ActivityPlaceApiModel[]>(entities);
            return models;
        }

        [PUT(SingleUrl)]
        public HttpResponseMessage Put(int activityId, int placeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new CreateActivityPlace(User, activityId)
            {
                PlaceId = placeId,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE(SingleUrl)]
        public HttpResponseMessage Delete(int activityId, int placeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new PurgeActivityPlace(User, activityId)
            {
                PlaceId = placeId,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [CacheHttpGet(Duration = 3600)]
        [GET(OptionsUrl, ControllerPrecedence = 1)]
        public IEnumerable<ActivityLocationNameApiModel> GetOptions()
        {
            // TODO: should we pull these lazily from a service instead of pushing them all down?
            var locations = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { IsCountry = true }));
            var water = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { IsWater = true }));
            var global = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { WoeIds = new[] { 1 } }));
            var regions = new List<Place>(_queryProcessor.Execute(new FilteredPlaces
            {
                WoeIds = new[]
                {
                    24865670, // Africa
                    28289421, // Antarctic
                    24865672, // North America
                    24865706, // Caribbean
                    55949061, // Central Asia
                    55949062, // South Asia
                    28289414, // South East Asia
                    24865675, // Europe
                    28289416, // East Asia
                    28289415, // Western Asia
                    24865716, // Latin America
                    24865707, // Central America
                    24865673, // South America
                    24865721, // Middle East
                    24865722, // North Africa
                    55949070, // Oceania
                    55949067, // Northern Europe
                    55949066, // Southern Europe
                    28289419, // Eastern Europe
                    28289418, // Western Europe
                }
            }));

            locations.AddRange(water);
            locations.AddRange(global);
            locations.AddRange(regions);

            var model = Mapper.Map<ActivityLocationNameApiModel[]>(locations.OrderBy(x => x.OfficialName).ToArray());
            return model;
        }
    }
}
