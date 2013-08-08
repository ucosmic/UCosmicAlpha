using System;
using System.Diagnostics;
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
    [RoutePrefix("api/language-expertise")]
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
        [GET("{expertiseId:int}", ControllerPrecedence = 1)]
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
        public HttpResponseMessage Post(LanguageExpertiseApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var createLanguageExpertiseCommand = new CreateLanguageExpertise(
                User,
                model.SpeakingProficiency,
                model.ListeningProficiency,
                model.ReadingProficiency,
                model.WritingProficiency)
            {
                LanguageId = model.LanguageId,
                Dialect = model.Dialect,
                Other = model.Other
            };

            _createLanguageExpertise.Handle(createLanguageExpertiseCommand);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Language expertise was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "LanguageExpertises",
                action = "Get",
                expertiseId = createLanguageExpertiseCommand.CreatedLanguageExpertiseId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an expertise
        */
        // --------------------------------------------------------------------------------
        [PUT("{expertiseId:int}")]
        public HttpResponseMessage Put(int expertiseId, LanguageExpertiseApiModel model)
        {
            if (expertiseId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            //try
            //{
            var updateLanguageExpertiseCommand = Mapper.Map<UpdateLanguageExpertise>(model);
            updateLanguageExpertiseCommand.UpdatedOn = DateTime.UtcNow;
            updateLanguageExpertiseCommand.Principal = User;
            _updateLanguageExpertise.Handle(updateLanguageExpertiseCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "LanguageExpertise update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an expertise
        */
        // --------------------------------------------------------------------------------
        [DELETE("{expertiseId:int}")]
        public HttpResponseMessage Delete(int expertiseId)
        {
            //try
            //{
            var deleteLanguageExpertiseCommand = new DeleteLanguageExpertise(User, expertiseId);
            _deleteLanguageExpertise.Handle(deleteLanguageExpertiseCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "LanguageExpertise delete error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
