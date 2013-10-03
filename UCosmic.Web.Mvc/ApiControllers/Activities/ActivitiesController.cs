using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    //[RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private const string PluralUrl =    "api/activities/";
        private const string SingleUrl =    "api/activities/{activityId:int}";
        private const string MoveUrl =      "api/activities/{workCopyActivityId:int}/{originalActivityId:int}/{mode}";

        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;
        private readonly IHandleCommands<ReplaceActivity> _replaceActivity;
        private readonly IHandleCommands<PurgeActivity> _purgeActivity;

        public ActivitiesController(IProcessQueries queryProcessor
            , IHandleCommands<UpdateActivity> updateActivity
            , IHandleCommands<ReplaceActivity> replaceActivity
            , IHandleCommands<PurgeActivity> purgeActivity
        )
        {
            _queryProcessor = queryProcessor;
            _updateActivity = updateActivity;
            _replaceActivity = replaceActivity;
            _purgeActivity = purgeActivity;
        }

        [GET(PluralUrl)]
        public PageOfActivityApiModel Get([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonId>(input);
            var page = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfActivityApiModel>(page);
            return model;
        }

        [GET(SingleUrl, ActionPrecedence = 1)]
        public ActivityApiModel Get(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                }
            });
            if (activity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        [GET("api/activities2/{activityId:int}", ActionPrecedence = 1)]
        public ActivityApiEditModel Get2(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                }
            });
            if (activity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var values = activity.Values.Single(x => x.Mode == x.Activity.Mode);
            var model = new ActivityApiEditModel
            {
                ActivityId = activityId,
                Mode = activity.Mode,
                Title = values.Title,
                Content = values.Content,
                StartsOn = values.StartsOn,
                EndsOn = values.EndsOn,
                OnGoing = values.OnGoing,
                StartsFormat = values.StartsFormat,
                EndsFormat = values.EndsFormat,
                IsExternallyFunded = values.WasExternallyFunded,
                IsInternallyFunded = values.WasInternallyFunded,
                UpdatedByPrincipal = activity.UpdatedByPrincipal,
                UpdatedOnUtc = activity.UpdatedOnUtc ?? activity.CreatedOnUtc,
            };
            return model;
        }

        [Authorize]
        [PUT(SingleUrl)]
        public HttpResponseMessage Put(int activityId, ActivityApiPutModel model)
        {
            // autosave invokes this method for everything except documents
            if (activityId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            // invoke update command using the model's id and mode
            var command = new UpdateActivity(User, activityId)
            {
                Impersonator = Request.GetHttpContext().Session.UserImpersonating(),
            };
            Mapper.Map(model, command);
            _updateActivity.Handle(command);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [Authorize]
        [PUT(MoveUrl)]
        public HttpResponseMessage PutMove(int workCopyActivityId, int originalActivityId, ActivityMode mode)
        {
            if (workCopyActivityId == 0 || originalActivityId == 0)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var command = new ReplaceActivity(User, workCopyActivityId, originalActivityId)
            {
                Mode = mode,
            };
            _replaceActivity.Handle(command);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [Authorize]
        [DELETE(SingleUrl)]
        public HttpResponseMessage Delete(int activityId)
        {
            try
            {
                var command = new PurgeActivity(User, activityId);
                _purgeActivity.Handle(command);
                return Request.CreateResponse(HttpStatusCode.OK, "Activity was successfully deleted.");
            }
            catch (ValidationException ex)
            {
                var error = ex.Errors.First();
                return 403.Equals(error.CustomState)
                    ? Request.CreateResponse(HttpStatusCode.Forbidden, error.ErrorMessage)
                    : Request.CreateResponse(HttpStatusCode.BadRequest, error.ErrorMessage);
            }
        }
    }
}
