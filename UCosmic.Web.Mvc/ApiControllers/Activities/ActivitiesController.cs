using System.Linq;
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
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
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

        [GET("")]
        public PageOfActivityApiModel Get([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonId>(input);
            var activities = _queryProcessor.Execute(query);
            if (activities == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfActivityApiModel>(activities);

            return model;
        }

        [GET("{activityId:int}")]
        public ActivityApiModel Get(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(User, activityId));
            if (activity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }


        [Authorize]
        [PUT("{activityId:int}")]
        public HttpResponseMessage Put(int activityId, ActivityApiModel model)
        {
            // autosave invokes this method for everything except documents
            if (activityId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            // invoke update command using the model's id and mode
            var command = new UpdateActivity(User, activityId)
            {
                Title = model.Values.Title,
                Content = model.Values.Content,
                Mode = model.ModeText.AsEnum<ActivityMode>(),
                DateFormat = model.Values.DateFormat,
                StartsOn = model.Values.StartsOn,
                EndsOn = model.Values.EndsOn,
                OnGoing = model.Values.OnGoing,
                WasExternallyFunded = model.Values.WasExternallyFunded,
                WasInternallyFunded = model.Values.WasInternallyFunded,
            };
            _updateActivity.Handle(command);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [Authorize]
        [PUT("{workCopyActivityId:int}/{originalActivityId:int}/{mode}")]
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
        [DELETE("{activityId}")]
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
