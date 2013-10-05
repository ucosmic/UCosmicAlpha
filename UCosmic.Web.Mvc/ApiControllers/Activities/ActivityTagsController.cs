using System;
using System.Collections.Generic;
using System.Linq;
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
    [RoutePrefix("api/activities/{activityId:int}/tags")]
    public class ActivityTagsController : ApiController
    {
        private const string PluralUrl = "";

        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateActivityTag> _createHandler;
        private readonly IHandleCommands<PurgeActivityTag> _purgeHandler;

        public ActivityTagsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateActivityTag> createHandler
            , IHandleCommands<PurgeActivityTag> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [GET(PluralUrl)]
        public IEnumerable<ActivityTagApiModel> Get(int activityId)
        {
            var entities = _queryProcessor.Execute(new ActivityTagsByActivityId(activityId)
            {
                EagerLoad = new Expression<Func<ActivityTag, object>>[]
                {
                    x => x.ActivityValues,
                }
            });
            var models = Mapper.Map<ActivityTagApiModel[]>(entities);
            return models;
        }

        [POST(PluralUrl)]
        public HttpResponseMessage Post(int activityId, ActivityTagApiPutModel model)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            if (activityId < 1 || model == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var command = new CreateActivityTag(User, activityId)
            {
                Text = model.Text,
                DomainKey = model.DomainKey,
                DomainType = model.DomainType,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _createHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE(PluralUrl)]
        public HttpResponseMessage Delete(int activityId, ActivityTagApiDeleteModel model)
        {
            //throw new HttpResponseException(HttpStatusCode.GatewayTimeout); // test api failures
            if (activityId < 1 || model == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var command = new PurgeActivityTag(User, activityId)
            {
                ActivityTagText = model.Text,
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            _purgeHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
