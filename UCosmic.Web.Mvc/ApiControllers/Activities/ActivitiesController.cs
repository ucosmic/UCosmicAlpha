using System;
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
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CopyActivityAndValues> _copyActivityAndValues;
        private readonly IHandleCommands<CreateActivityAndValues> _createActivityAndValues;
        private readonly IHandleCommands<DeleteActivity> _deleteActivity;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;

        public ActivitiesController(IProcessQueries queryProcessor
                                  , IHandleCommands<CopyActivityAndValues> copyActivityAndValues
                                  , IHandleCommands<CreateActivityAndValues> createActivityAndValues
                                  , IHandleCommands<DeleteActivity> deleteActivity
                                  , IHandleCommands<UpdateActivity> updateActivity
                            )
        {
            _queryProcessor = queryProcessor;
            _copyActivityAndValues = copyActivityAndValues;
            _createActivityAndValues = createActivityAndValues;
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
            var activity = _queryProcessor.Execute(new ActivityByEntityId(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity copy for editing (or recover edit copy)
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [GET("{activityId}/edit")]
        public ActivityApiModel GetEdit(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.WorkCopy,
                },
            });
            if (activity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            /* Search for an "in progress edit" activity.  This can happen if the user
             * navigates away from Activity Edit page before saving. */
            //var editActivity = _queryProcessor.Execute(new ActivityByEditSourceId(activity.RevisionId));
            var editActivity = activity.WorkCopy;

            /* Not sure how this scenario arises, but I've seen it once. It might have been
             * the result of debugging.  If we have an edit activity with no values, delete it.
             */
            if ((editActivity != null) && (editActivity.Values.Count == 0))
            {
                var deleteActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
                _deleteActivity.Handle(deleteActivityCommand);
                editActivity = null;
            }

            if (editActivity == null)
            {
                /* There's no "in progress edit" record, so we make a copy of the
                     * activity and set it to edit mode. */
                var copyActivityAndValues = new CopyActivityAndValues(User, activityId);

                _copyActivityAndValues.Handle(copyActivityAndValues);

                editActivity = copyActivityAndValues.CreatedActivity;
            }

            var model = Mapper.Map<ActivityApiModel>(editActivity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity's edit state.
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [GET("{activityId}/edit-state")]
        public ActivityEditState GetEditState(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var editState = new ActivityEditState
            {
                IsInEdit = activity.Original != null,
                EditingUserName = "",
                EditingUserEmail = ""
            };

            // TBD

            return editState;
        }


        // --------------------------------------------------------------------------------
        /*
         * Create an activity
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [POST("")]
        public HttpResponseMessage Post()
        {
            var command = new CreateActivityAndValues(User, ActivityMode.Draft);
            _createActivityAndValues.Handle(command);

            var model = command.CreatedActivity.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}")]
        [Authorize]
        public HttpResponseMessage Put(int activityId, ActivityApiModel model)
        {
            if ((activityId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var activity = Mapper.Map<Activity>(model);

            //try
            //{
            var updateActivityCommand = new UpdateActivity(User, activity.RevisionId, activity.ModeText)
            {
                Values = activity.Values.SingleOrDefault(x => x.ModeText == activity.ModeText),
            };
            _updateActivity.Handle(updateActivityCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Activity update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

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
            //try
            //{
            var editActivity = _queryProcessor.Execute(new ActivityById(activityId));
            if (editActivity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            if (editActivity.Original == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var updateActivityCommand = new UpdateActivity(User, editActivity.Original.RevisionId, model.Mode)
            {
                Values = editActivity.Values.SingleOrDefault(x => x.ModeText == editActivity.ModeText)
            };
            _updateActivity.Handle(updateActivityCommand);

            var deleteActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
            _deleteActivity.Handle(deleteActivityCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Activity update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an activity
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [DELETE("{activityId}")]
        public HttpResponseMessage Delete(int activityId)
        {
            var activityToDelete = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Original,
                    x => x.WorkCopy,
                },
            });
            if (activityToDelete == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var deleteActivity = new DeleteActivity(User, activityToDelete.RevisionId);
            _deleteActivity.Handle(deleteActivity);

            if (activityToDelete.Original != null && activityToDelete.Original.IsEmpty())
            {
                deleteActivity = new DeleteActivity(User, activityToDelete.Original.RevisionId);
                _deleteActivity.Handle(deleteActivity);
            }
            else if (activityToDelete.WorkCopy != null)
            {
                deleteActivity = new DeleteActivity(User, activityToDelete.WorkCopy.RevisionId);
                _deleteActivity.Handle(deleteActivity);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
