using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities/{activityId:int}/places")]
    public class ActivityPlacesController : ApiController
    {
        private const string PluralUrl = "";
        private const string SingleUrl = "{placeId:int}";

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
                EagerLoad = new Expression<Func<ActivityLocation, object>>[]
                {
                    x => x.ActivityValues,
                    x => x.Place,
                }
            });
            var models = entities.Select(x => new ActivityPlaceApiModel
            {
                ActivityId = x.ActivityValues.ActivityId,
                PlaceId = x.PlaceId,
                PlaceName = x.Place.OfficialName,
            });
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
    }
}
