using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.GeographicExpertises;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/geographic-expertises")]
    public class GeographicExpertisesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateGeographicExpertise> _createGeographicExpertise;
        private readonly IHandleCommands<DeleteGeographicExpertise> _deleteGeographicExpertise;
        private readonly IHandleCommands<UpdateGeographicExpertise> _updateGeographicExpertise;

        public GeographicExpertisesController(IProcessQueries queryProcessor
                                  , IHandleCommands<CreateGeographicExpertise> createGeographicExpertise
                                  , IHandleCommands<DeleteGeographicExpertise> deleteGeographicExpertise
                                  , IHandleCommands<UpdateGeographicExpertise> updateGeographicExpertise)
        {
            _queryProcessor = queryProcessor;
            _createGeographicExpertise = createGeographicExpertise;
            _deleteGeographicExpertise = deleteGeographicExpertise;
            _updateGeographicExpertise = updateGeographicExpertise;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of expertises
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfGeographicExpertiseApiModel Get([FromUri] GeographicExpertiseSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<GeographicExpertiseSearchInputModel, GeographicExpertisesByPersonId>(input);
            var expertises = _queryProcessor.Execute(query);
            if (expertises == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfGeographicExpertiseApiModel>(expertises);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an degree
        */
        // --------------------------------------------------------------------------------
        [GET("{expertiseId}")]
        public GeographicExpertiseApiModel Get(int expertiseId)
        {
            var degree = _queryProcessor.Execute(new GeographicExpertiseById(expertiseId));
            if (degree == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<GeographicExpertiseApiModel>(degree);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an degree
        */
        // --------------------------------------------------------------------------------
        [POST("")]
        public HttpResponseMessage Post()
        {
            var global = _queryProcessor.Execute(new PlacesWithName
                { Term = "Global", MaxResults = 1, TermMatchStrategy = StringMatchStrategy.Equals }).ToArray();
            var createDeepGeographicExpertiseCommand = new CreateGeographicExpertise(User, global[0].RevisionId);
            _createGeographicExpertise.Handle(createDeepGeographicExpertiseCommand);

            var model = createDeepGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an degree
        */
        // --------------------------------------------------------------------------------
        [PUT("{expertiseId}")]
        public HttpResponseMessage Put(int expertiseId, GeographicExpertiseApiModel model)
        {
            if ((expertiseId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            try
            {
                var updateGeographicExpertiseCommand = Mapper.Map<UpdateGeographicExpertise>(model);
                updateGeographicExpertiseCommand.UpdatedOn = DateTime.UtcNow;
                updateGeographicExpertiseCommand.Principal = User;
                _updateGeographicExpertise.Handle(updateGeographicExpertiseCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "GeographicExpertise update error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an degree
        */
        // --------------------------------------------------------------------------------
        [DELETE("{expertiseId}")]
        public HttpResponseMessage Delete(int expertiseId)
        {
            try
            {
                var deleteGeographicExpertiseCommand = new DeleteGeographicExpertise(User, expertiseId);
                _deleteGeographicExpertise.Handle(deleteGeographicExpertiseCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "GeographicExpertise delete error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
