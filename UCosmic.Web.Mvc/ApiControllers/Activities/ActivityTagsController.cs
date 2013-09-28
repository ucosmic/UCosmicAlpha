using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities/{activityId:int}/tags")]
    public class ActivityTagsController : ApiController
    {
        private readonly IHandleCommands<AddActivityTag> _createHandler;
        private readonly IHandleCommands<RemoveActivityTag> _purgeHandler;

        public ActivityTagsController(IHandleCommands<AddActivityTag> createHandler, IHandleCommands<RemoveActivityTag> purgeHandler)
        {
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [POST("")]
        public HttpResponseMessage Post(int activityId, ActivityTagApiPutModel model)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            if (activityId < 1 || model == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var command = new AddActivityTag(User, activityId)
            {
                Text = model.Text,
                DomainKey = model.DomainKey,
                DomainType = model.DomainType,
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("")]
        public HttpResponseMessage Delete(int activityId, ActivityTagApiDeleteModel model)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            if (activityId < 1 || model == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var command = new RemoveActivityTag(User, activityId)
            {
                ActivityTagText = model.Text
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
