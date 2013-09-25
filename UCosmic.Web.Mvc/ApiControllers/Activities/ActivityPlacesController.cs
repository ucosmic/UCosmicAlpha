using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("activities/{activityId:int}/places")]
    public class ActivityPlacesController : ApiController
    {
        private readonly IHandleCommands<CreateActivityPlace> _createHandler;
        private readonly IHandleCommands<PurgeActivityPlace> _purgeHandler;

        public ActivityPlacesController(IHandleCommands<CreateActivityPlace> createHandler, IHandleCommands<PurgeActivityPlace> purgeHandler)
        {
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [PUT("{placeId:int}")]
        public HttpResponseMessage Put(int activityId, int placeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new CreateActivityPlace(User, activityId)
            {
                PlaceId = placeId,
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("{placeId:int}")]
        public HttpResponseMessage Delete(int activityId, int placeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new PurgeActivityPlace(User, activityId)
            {
                PlaceId = placeId,
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
