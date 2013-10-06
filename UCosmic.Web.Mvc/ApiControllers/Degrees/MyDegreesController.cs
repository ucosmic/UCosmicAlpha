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
    [Authorize]
    [RoutePrefix("api/my/degrees")]
    public class MyDegreesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateDegree> _createHandler;
        private readonly IHandleCommands<UpdateDegree> _updateHandler;
        private readonly IHandleCommands<DeleteDegree> _deleteHandler;

        public MyDegreesController(IProcessQueries queryProcessor
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

        [GET("")]
        public PageOfDegreeApiModel Get([FromUri] DegreeSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = new MyDegrees(User);
            Mapper.Map(input, query);
            query.OrderBy = new Dictionary<Expression<Func<Degree, object>>, OrderByDirection>
            {
                { x => x.RevisionId, OrderByDirection.Ascending },
            };
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfDegreeApiModel>(entities);
            return model;
        }

        [GET("{degreeId:int}", ControllerPrecedence = 1)]
        public DegreeApiModel Get(int degreeId)
        {
            var entity = _queryProcessor.Execute(new MyDegreeById(User, degreeId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<DegreeApiModel>(entity);
            return model;
        }

        [POST("")]
        public HttpResponseMessage Post(DegreeApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var command = new CreateDegree(User);
            Mapper.Map(model, command);
            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Degree was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "MyDegrees",
                action = "Get",
                degreeId = command.CreatedDegreeId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{degreeId:int}")]
        public HttpResponseMessage Put(int degreeId, DegreeApiModel model)
        {
            if (degreeId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            model.Id = degreeId;
            var command = new UpdateDegree(User, degreeId);
            Mapper.Map(model, command);
            _updateHandler.Handle(command);

            return Request.CreateResponse(HttpStatusCode.OK, "Degree was successfully saved.");
        }

        [DELETE("{degreeId:int}")]
        [Authorize(Roles = RoleName.EmployeeProfileManager)]
        public HttpResponseMessage Delete(int degreeId)
        {
            var command = new DeleteDegree(User, degreeId);
            _deleteHandler.Handle(command);
            return Request.CreateResponse(HttpStatusCode.OK, "Degree was successfully deleted.");
        }
    }
}
