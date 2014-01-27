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
        private const string PluralUrl =    "";
        private const string SingleUrl =    "{activityId:int}";
        private const string CopyUrl = "{activityId:int}/copy";
        private const string MoveUrl = "{workCopyActivityId:int}/{originalActivityId:int}/{mode}";

        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;
        private readonly IHandleCommands<ReplaceActivity> _replaceActivity;
        private readonly IHandleCommands<PurgeActivity> _purgeActivity;
        private readonly IHandleCommands<CopyActivityAndValues> _copyActivityAndValues;

        public ActivitiesController(IProcessQueries queryProcessor
            , IHandleCommands<UpdateActivity> updateActivity
            , IHandleCommands<ReplaceActivity> replaceActivity
            , IHandleCommands<PurgeActivity> purgeActivity
            , IHandleCommands<CopyActivityAndValues> copyActivityAndValues
        )
        {
            _queryProcessor = queryProcessor;
            _updateActivity = updateActivity;
            _replaceActivity = replaceActivity;
            _purgeActivity = purgeActivity;
            _copyActivityAndValues = copyActivityAndValues;
        }

        [GET(PluralUrl)]
        public PageOfActivityApiModel Get([FromUri] MyActivitiesInputModel input)
        {
            if (input == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            if (input.PageNumber < 1) input.PageNumber = 1;
            if (input.PageSize < 1) input.PageSize = 10;

            var query = new MyActivityValues(User)
            {
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Activity,
                    x => x.Documents,
                    x => x.Locations.Select(y => y.Place),
                    x => x.Tags,
                    x => x.Types.Select(y => y.Type),
                }
            };
            Mapper.Map(input, query);
            var page = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfActivityApiModel>(page);
            return model;
        }

        [GET(SingleUrl, ActionPrecedence = 1)]
        public ActivityApiModel Get(int activityId)
        {
            var entity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = ActivityApiModel.EagerLoad,
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<ActivityApiModel>(entity);
            return model;
        }

        [GET(CopyUrl, ActionPrecedence = 1)]
        public ActivityApiModel GetCopy(int activityId)
        {
            var entity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.WorkCopy,
                },
            });

            if (entity != null && entity.WorkCopy != null)
                return Get(entity.WorkCopy.RevisionId);

            var command = new CopyActivityAndValues(User, activityId);
            _copyActivityAndValues.Handle(command);
            return Get(command.CreatedActivity.RevisionId);

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
