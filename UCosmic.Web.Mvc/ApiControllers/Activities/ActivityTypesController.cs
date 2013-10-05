using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities/{activityId:int}/types")]
    public class ActivityTypesController : ApiController
    {
        private const string PluralUrl = "";
        private const string SingleUrl = "{activityTypeId:int}";

        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateActivityType> _createHandler;
        private readonly IHandleCommands<PurgeActivityType> _purgeHandler;

        public ActivityTypesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateActivityType> createHandler
            , IHandleCommands<PurgeActivityType> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [GET(PluralUrl)]
        public IEnumerable<ActivityTypeApiModel> Get(int activityId)
        {
            var entities = _queryProcessor.Execute(new ActivityTypesByActivityId(activityId)
            {
                EagerLoad = ActivityTypeApiModel.EagerLoad,
            });
            var models = Mapper.Map<ActivityTypeApiModel[]>(entities);
            return models;
        }

        [PUT(SingleUrl)]
        public HttpResponseMessage Put(int activityId, int activityTypeId)
        {
            //Thread.Sleep(2000);
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new CreateActivityType(User, activityId)
            {
                ActivityTypeId = activityTypeId,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE(SingleUrl)]
        public HttpResponseMessage Delete(int activityId, int activityTypeId)
        {
            //Thread.Sleep(2000);
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            var command = new PurgeActivityType(User, activityId)
            {
                ActivityTypeId = activityTypeId,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
