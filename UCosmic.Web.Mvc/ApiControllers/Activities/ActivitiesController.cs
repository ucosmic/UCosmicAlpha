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
using FluentValidation;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private const string PluralUrl =    "";
        private const string SingleUrl =    "{activityId:int}";
        private const string MoveUrl =      "{workCopyActivityId:int}/{originalActivityId:int}/{mode}";

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
        public PageOfActivityApiEditModel Get([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = new MyActivities(User)
            {
                PageNumber = input.PageNumber,
                PageSize = input.PageSize,
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Locations.Select(z => z.Place)),
                    x => x.Values.Select(y => y.Types.Select(z => z.Type)),
                    x => x.Values.Select(y => y.Tags),
                    x => x.Values.Select(y => y.Documents),
                },
                /* Order as follows:
                 *  All ongoing first by fromDate, then title
                 *  If date(s) exist, order by:
                 *      if toDate exists, sort most recent first else, use fromDate
                 *          then alphabetically by title
                 *
                 *  Activities with no dates are listed last
                 */
                OrderBy = new Dictionary<Expression<Func<Activity, object>>, OrderByDirection>
                {
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing.HasValue, OrderByDirection.Descending }, // null ongoings at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing, OrderByDirection.Descending }, // true ongoings above false ongoings
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.HasValue, OrderByDirection.Descending }, // null start dates at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.HasValue, OrderByDirection.Descending }, // null end dates at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn, OrderByDirection.Descending }, // latest ending at top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn, OrderByDirection.Descending }, // latest starting at top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).Title, OrderByDirection.Ascending }, // title A-Z
                },
            };

            var page = _queryProcessor.Execute(query);
            var model = new PageOfActivityApiEditModel
            {
                ItemTotal = page.ItemTotal,
                PageNumber = page.PageNumber,
                PageSize = page.PageSize,
                Items = page.Select(x => new ActivityApiEditModel
                {
                    ActivityId = x.RevisionId,
                    Mode = x.Mode,
                    Content = x.Values.Single(y => y.Mode == y.Activity.Mode).Content,
                    Title = x.Values.Single(y => y.Mode == y.Activity.Mode).Title,
                    OnGoing = x.Values.Single(y => y.Mode == y.Activity.Mode).OnGoing,
                    StartsOn = x.Values.Single(y => y.Mode == y.Activity.Mode).StartsOn,
                    StartsFormat = x.Values.Single(y => y.Mode == y.Activity.Mode).StartsFormat,
                    EndsOn = x.Values.Single(y => y.Mode == y.Activity.Mode).EndsOn,
                    EndsFormat = x.Values.Single(y => y.Mode == y.Activity.Mode).EndsFormat,
                    IsExternallyFunded = x.Values.Single(y => y.Mode == y.Activity.Mode).WasExternallyFunded,
                    IsInternallyFunded = x.Values.Single(y => y.Mode == y.Activity.Mode).WasExternallyFunded,
                    UpdatedOnUtc = x.UpdatedOnUtc ?? x.CreatedOnUtc,
                    UpdatedByPrincipal = x.UpdatedByPrincipal,
                    Types = x.Values.Single(y => y.Mode == y.Activity.Mode).Types.Select(y => new ActivityTypeApiModel2
                    {
                        ActivityId = x.RevisionId,
                        TypeId = y.TypeId,
                        Text = y.Type.Type,
                        Rank = y.Type.Rank,
                    }).ToArray(),
                    Places = x.Values.Single(y => y.Mode == y.Activity.Mode).Locations.Select(y => new ActivityPlaceApiModel
                    {
                        ActivityId = x.RevisionId,
                        PlaceId = y.PlaceId,
                        PlaceName = y.Place.OfficialName,
                    }).ToArray(),
                    Documents = x.Values.Single(y => y.Mode == y.Activity.Mode).Documents.Select(y => new ActivityDocumentApiModel2
                    {
                        ActivityId = x.RevisionId,
                        DocumentId = y.RevisionId,
                        Title = y.Title,
                        ByteCount = y.Length,
                        FileName = y.FileName,
                    }).ToArray(),
                }),
            };
            return model;
        }

        [GET(SingleUrl, ActionPrecedence = 1)]
        public ActivityApiEditModel Get(int activityId)
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
