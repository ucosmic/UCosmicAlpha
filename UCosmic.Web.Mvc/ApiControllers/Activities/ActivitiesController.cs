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
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<DeleteActivity> _deleteActivity;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;

        public ActivitiesController(IProcessQueries queryProcessor
                                  , IHandleCommands<DeleteActivity> deleteActivity
                                  , IHandleCommands<UpdateActivity> updateActivity
                            )
        {
            _queryProcessor = queryProcessor;
            _deleteActivity = deleteActivity;
            _updateActivity = updateActivity;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of activities
        */
        // --------------------------------------------------------------------------------
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

        // --------------------------------------------------------------------------------
        /*
         * Get an activity
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}")]
        public ActivityApiModel Get(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(User, activityId));
            if (activity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity copy for editing (or recover edit copy)
        */
        // --------------------------------------------------------------------------------
        //[Authorize]
        //[GET("{activityId}/edit")]
        //public ActivityApiModel GetEdit(int activityId)
        //{
        //    /* Get the activity we want to edit */
        //    var activity = _queryProcessor.Execute(new ActivityById(activityId)
        //    {
        //        EagerLoad = new Expression<Func<Activity, object>>[]
        //        {
        //            x => x.WorkCopy,
        //        },
        //    });
        //    if (activity == null || activity.WorkCopy == null)
        //        throw new HttpResponseException(HttpStatusCode.NotFound);

        //    /* Search for an "in progress edit" activity.  This can happen if the user
        //     * navigates away from Activity Edit page before saving. */
        //    //var editActivity = _queryProcessor.Execute(new ActivityByEditSourceId(activity.RevisionId));
        //    //var editActivity = activity.WorkCopy;

        //    /* Not sure how this scenario arises, but I've seen it once. It might have been
        //     * the result of debugging.  If we have an edit activity with no values, delete it.
        //     */
        //    //if (activity.WorkCopy != null && activity.WorkCopy.Values.Count == 0)
        //    //{
        //    //    var deleteActivityCommand = new DeleteActivity(User, activity.WorkCopy.RevisionId);
        //    //    _deleteActivity.Handle(deleteActivityCommand);
        //    //    activity.WorkCopy = null;
        //    //}

        //    //if (editActivity == null)
        //    //{
        //        /* There's no "in progress edit" record, so we make a copy of the
        //             * activity and set it to edit mode. */
        //        //var copyActivityAndValues = new CopyActivityAndValues(User, activityId);

        //        //_copyActivityAndValues.Handle(copyActivityAndValues);

        //        //editActivity = copyActivityAndValues.CreatedActivity;
        //    //}

        //    var model = Mapper.Map<ActivityApiModel>(activity.WorkCopy);
        //    return model;
        //}

        // --------------------------------------------------------------------------------
        /*
         * Get an activity's edit state.
        */
        // --------------------------------------------------------------------------------
        //[Authorize]
        //[GET("{activityId}/edit-state")]
        //public ActivityEditState GetEditState(int activityId)
        //{
        //    /* Get the activity we want to edit */
        //    var activity = _queryProcessor.Execute(new ActivityById(activityId));
        //    if (activity == null)
        //    {
        //        throw new HttpResponseException(HttpStatusCode.NotFound);
        //    }

        //    var editState = new ActivityEditState
        //    {
        //        IsInEdit = activity.Original != null,
        //        EditingUserName = "",
        //        EditingUserEmail = ""
        //    };

        //    // TBD

        //    return editState;
        //}


        // --------------------------------------------------------------------------------
        /*
         * Create an activity
        */
        // --------------------------------------------------------------------------------
        //[Authorize]
        //[POST("")]
        //public HttpResponseMessage Post()
        //{
        //    var command = new CreateActivityAndValues(User, ActivityMode.Draft);
        //    _createActivityAndValues.Handle(command);

        //    var model = command.CreatedActivity.RevisionId;
        //    return Request.CreateResponse(HttpStatusCode.OK, model);
        //}

        // --------------------------------------------------------------------------------

        /*
         * Update an activity
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [PUT("{activityId}")]
        public HttpResponseMessage Put(int activityId, ActivityApiModel model)
        {
            // autosave invokes this method for everything except documents
            if (activityId == 0 || model == null || model.Id != activityId)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            // map the api model to an activity entity
            var activity = Mapper.Map<Activity>(model);

            // invoke update command using the model's id and mode
            var updateActivityCommand = new UpdateActivity(User, activity.RevisionId, activity.ModeText)
            {
                // pass the values from the mapped activity
                Values = activity.Values.SingleOrDefault(x => x.ModeText == activity.ModeText),
            };
            _updateActivity.Handle(updateActivityCommand);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity, copying the Edit mode Activity to corresponding non-Edit
         * mode Activity.  The activityId must be of that of an Activity in "edit mode".
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [PUT("{activityId}/edit")]
        public HttpResponseMessage PutEdit(int activityId, [FromBody] ActivityPutEditApiModel model)
        {
            // load the activity requested from the url
            var editActivity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Original,
                }
            });
            if (editActivity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // this put must always be called for the non-original activity in the pair
            if (editActivity.Original == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            // invoke update using the original activity's id and the requested mode (only time model is used)
            var updateActivityCommand = new UpdateActivity(User, editActivity.Original.RevisionId, model.Mode)
            {
                // use the values from the non-original activity for the non-original activity's mode
                Values = editActivity.Values.SingleOrDefault(x => x.ModeText == editActivity.ModeText)
            };
            _updateActivity.Handle(updateActivityCommand);

            // delete the non-original activity
            var deleteActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
            _deleteActivity.Handle(deleteActivityCommand);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [Authorize]
        [DELETE("{activityId}")]
        public HttpResponseMessage Delete(int activityId)
        {
            try
            {
                var command = new DeleteActivity(User, activityId);
                _deleteActivity.Handle(command);
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
