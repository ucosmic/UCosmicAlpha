using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities/{activityId:int}/types")]
    public class ActivityTypesController : ApiController
    {
        private readonly IHandleCommands<CreateActivityType> _createHandler;
        private readonly IHandleCommands<PurgeActivityType> _purgeHandler;

        public ActivityTypesController(IHandleCommands<CreateActivityType> createHandler, IHandleCommands<PurgeActivityType> purgeHandler)
        {
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [PUT("{activityTypeId:int}")]
        public HttpResponseMessage Put(int activityId, int activityTypeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new CreateActivityType(User, activityId)
            {
                ActivityTypeId = activityTypeId,
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("{activityTypeId:int}")]
        public HttpResponseMessage Delete(int activityId, int activityTypeId)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new PurgeActivityType(User, activityId)
            {
                ActivityTypeId = activityTypeId,
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
