using System;
using System.Diagnostics;
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
    [RoutePrefix("api/degrees")]
    public class DegreesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateDegree> _createDegree;
        private readonly IHandleCommands<DeleteDegree> _deleteDegree;
        private readonly IHandleCommands<UpdateDegree> _updateDegree;

        public DegreesController(IProcessQueries queryProcessor
                                  , IHandleCommands<CreateDegree> createDegree
                                  , IHandleCommands<DeleteDegree> deleteDegree
                                  , IHandleCommands<UpdateDegree> updateDegree)
        {
            _queryProcessor = queryProcessor;
            _createDegree = createDegree;
            _deleteDegree = deleteDegree;
            _updateDegree = updateDegree;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of degrees
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfDegreeApiModel Get([FromUri] DegreeSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<DegreeSearchInputModel, DegreesByPersonId>(input);
            var degrees = _queryProcessor.Execute(query);
            if (degrees == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfDegreeApiModel>(degrees);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an degree
        */
        // --------------------------------------------------------------------------------
        [GET("{degreeId:int}", ControllerPrecedence = 1)]
        public DegreeApiModel Get(int degreeId)
        {
            var degree = _queryProcessor.Execute(new DegreeById(degreeId));
            if (degree == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<DegreeApiModel>(degree);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an degree
        */
        // --------------------------------------------------------------------------------
        [POST("")]
        public HttpResponseMessage Post(DegreeApiModel model)
        {
            if (model == null || model.Title == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var createDeepDegreeCommand = new CreateDegree(User, model.Title)
            {
                YearAwarded = model.YearAwarded,
                InstitutionId = model.InstitutionId
            };
            _createDegree.Handle(createDeepDegreeCommand);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Degree was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Degrees",
                action = "Get",
                degreeId = createDeepDegreeCommand.CreatedDegreeId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an degree
        */
        // --------------------------------------------------------------------------------
        [PUT("{degreeId:int}")]
        public HttpResponseMessage Put(int degreeId, DegreeApiModel model)
        {
            if ((degreeId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            //try
            //{
            var updateDegreeCommand = Mapper.Map<UpdateDegree>(model);
            updateDegreeCommand.UpdatedOn = DateTime.UtcNow;
            updateDegreeCommand.Principal = User;
            _updateDegree.Handle(updateDegreeCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Degree update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an degree
        */
        // --------------------------------------------------------------------------------
        [DELETE("{degreeId:int}")]
        public HttpResponseMessage Delete(int degreeId)
        {
            //try
            //{
            var deleteDegreeCommand = new DeleteDegree(User, degreeId);
            _deleteDegree.Handle(deleteDegreeCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Degree delete error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
