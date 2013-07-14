using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.LanguageExpertise;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/language-expertises")]
    public class LanguageExpertisesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateLanguageExpertise> _createLanguageExpertise;
        private readonly IHandleCommands<DeleteLanguageExpertise> _deleteLanguageExpertise;
        private readonly IHandleCommands<UpdateLanguageExpertise> _updateLanguageExpertise;

        public LanguageExpertisesController(IProcessQueries queryProcessor
                                  , IHandleCommands<CreateLanguageExpertise> createLanguageExpertise
                                  , IHandleCommands<DeleteLanguageExpertise> deleteLanguageExpertise
                                  , IHandleCommands<UpdateLanguageExpertise> updateLanguageExpertise)
        {
            _queryProcessor = queryProcessor;
            _createLanguageExpertise = createLanguageExpertise;
            _deleteLanguageExpertise = deleteLanguageExpertise;
            _updateLanguageExpertise = updateLanguageExpertise;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of expertises
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfLanguageExpertiseApiModel Get([FromUri] LanguageExpertiseSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<LanguageExpertiseSearchInputModel, LanguageExpertisesByPersonId>(input);
            var expertises = _queryProcessor.Execute(query);
            if (expertises == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfLanguageExpertiseApiModel>(expertises);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an expertise
        */
        // --------------------------------------------------------------------------------
        [GET("{expertiseId}")]
        public LanguageExpertiseApiModel Get(int expertiseId)
        {
            var expertise = _queryProcessor.Execute(new LanguageExpertiseById(expertiseId));
            if (expertise == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<LanguageExpertiseApiModel>(expertise);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an expertise
        */
        // --------------------------------------------------------------------------------
        [POST("")]
        public HttpResponseMessage Post(LanguageExpertiseApiModel newModel)
        {
            if ( newModel == null )
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var createLanguageExpertiseCommand = new CreateLanguageExpertise(
                User,
                newModel.SpeakingProficiency,
                newModel.ListeningProficiency,
                newModel.ReadingProficiency,
                newModel.WritingProficiency)
            {
                LanguageId = newModel.LanguageId,
                Dialect = newModel.Dialect,
                Other = newModel.Other
            };

            _createLanguageExpertise.Handle(createLanguageExpertiseCommand);
            var id = createLanguageExpertiseCommand.CreatedLanguageExpertise.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, id);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an expertise
        */
        // --------------------------------------------------------------------------------
        [PUT("{expertiseId}")]
        public HttpResponseMessage Put(int expertiseId, LanguageExpertiseApiModel model)
        {
            if ((expertiseId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            try
            {
                var updateLanguageExpertiseCommand = Mapper.Map<UpdateLanguageExpertise>(model);
                updateLanguageExpertiseCommand.UpdatedOn = DateTime.UtcNow;
                updateLanguageExpertiseCommand.Principal = User;
                _updateLanguageExpertise.Handle(updateLanguageExpertiseCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "LanguageExpertise update error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an expertise
        */
        // --------------------------------------------------------------------------------
        [DELETE("{expertiseId}")]
        public HttpResponseMessage Delete(int expertiseId)
        {
            try
            {
                var deleteLanguageExpertiseCommand = new DeleteLanguageExpertise(User, expertiseId);
                _deleteLanguageExpertise.Handle(deleteLanguageExpertiseCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "LanguageExpertise delete error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
