using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Degrees;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class DegreesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateDegree> _createHandler;
        private readonly IHandleCommands<UpdateDegree> _updateHandler;
        private readonly IHandleCommands<DeleteDegree> _deleteHandler;

        public DegreesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateDegree> createHandler
            , IHandleCommands<UpdateDegree> updateHandler
            , IHandleCommands<DeleteDegree> deleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _deleteHandler = deleteHandler;
            _updateHandler = updateHandler;
        }

        [GET("people/{personId:int}/degrees")]
        public PageOfDegreeApiModel Get(int personId, [FromUri] DegreeSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = new DegreesByPersonId(personId);
            Mapper.Map(input, query);
            query.OrderBy = new Dictionary<Expression<Func<Degree, object>>, OrderByDirection>
            {
                { x => x.RevisionId, OrderByDirection.Ascending },
            };
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfDegreeApiModel>(entities);
            return model;
        }

        [GET("people/{personId:int}/degrees/{degreeId:int}", ControllerPrecedence = 1)]
        public DegreeApiModel Get(int personId, int degreeId)
        {
            var degree = _queryProcessor.Execute(new DegreeById(degreeId, personId));
            if (degree == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<DegreeApiModel>(degree);
            return model;
        }

        [POST("people/{personId:int}/degrees")]
        [Authorize(Roles = RoleName.EmployeeProfileManager)]
        public HttpResponseMessage Post(int personId, DegreeApiModel model)
        {
            if (model == null || personId == 0)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            model.PersonId = personId;
            var command = new CreateDegree(User, personId);
            Mapper.Map(model, command);
            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Degree was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Degrees",
                action = "Get",
                degreeId = command.CreatedDegreeId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("people/{personId:int}/degrees/{degreeId:int}")]
        [Authorize(Roles = RoleName.EmployeeProfileManager)]
        public HttpResponseMessage Put(int personId, int degreeId, DegreeApiModel model)
        {
            if (degreeId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            model.PersonId = personId;
            model.Id = degreeId;
            var command = new UpdateDegree(User, degreeId, personId);
            Mapper.Map(model, command);
            _updateHandler.Handle(command);

            return Request.CreateResponse(HttpStatusCode.OK, "Degree was successfully saved.");
        }

        [DELETE("people/{personId:int}/degrees/{degreeId:int}")]
        [Authorize(Roles = RoleName.EmployeeProfileManager)]
        public HttpResponseMessage Delete(int personId, int degreeId)
        {
            var command = new DeleteDegree(User, degreeId, personId);
            _deleteHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK, "Degree was successfully deleted.");
        }
    }
}
