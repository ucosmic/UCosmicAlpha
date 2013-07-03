using System;
using System.Collections.ObjectModel;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.InternationalAffiliations;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/international-affiliations")]
    public class InternationalAffiliationsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateDeepInternationalAffiliation> _createDeepInternationalAffiliation;
        private readonly IHandleCommands<DeleteInternationalAffiliation> _deleteInternationalAffiliation;
        private readonly IHandleCommands<UpdateInternationalAffiliation> _updateInternationalAffiliation;

        public InternationalAffiliationsController(IProcessQueries queryProcessor
                                  , IHandleCommands<CreateDeepInternationalAffiliation> createDeepInternationalAffiliation
                                  , IHandleCommands<DeleteInternationalAffiliation> deleteInternationalAffiliation
                                  , IHandleCommands<UpdateInternationalAffiliation> updateInternationalAffiliation)
        {
            _queryProcessor = queryProcessor;
            _createDeepInternationalAffiliation = createDeepInternationalAffiliation;
            _deleteInternationalAffiliation = deleteInternationalAffiliation;
            _updateInternationalAffiliation = updateInternationalAffiliation;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of affiliations
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfInternationalAffiliationApiModel Get([FromUri] InternationalAffiliationSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<InternationalAffiliationSearchInputModel, InternationalAffiliationsByPersonId>(input);
            var affiliations = _queryProcessor.Execute(query);
            if (affiliations == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfInternationalAffiliationApiModel>(affiliations);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an affiliation
        */
        // --------------------------------------------------------------------------------
        [GET("{affiliationId}")]
        public InternationalAffiliationApiModel Get(int affiliationId)
        {
            var affiliation = _queryProcessor.Execute(new InternationalAffiliationById(affiliationId));
            if (affiliation == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<InternationalAffiliationApiModel>(affiliation);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an affiliation
        */
        // --------------------------------------------------------------------------------
        [POST("")]
        public HttpResponseMessage Post(InternationalAffiliationApiModel newModel)
        {
            if ( (newModel == null) ||
                 (newModel.Locations == null) ||
                 (newModel.Locations.Count == 0) )
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var newLocations = new Collection<int>();
            foreach (var location in newModel.Locations)
            {
                newLocations.Add(location.PlaceId);
            }
            var createDeepInternationalAffiliationCommand = new CreateDeepInternationalAffiliation(User, newLocations)
            {
                From = newModel.From,
                To = newModel.To,
                OnGoing = newModel.OnGoing,
                Institution = newModel.Institution,
                Position = newModel.Position
            };
            _createDeepInternationalAffiliation.Handle(createDeepInternationalAffiliationCommand);
            var id = createDeepInternationalAffiliationCommand.CreatedInternationalAffiliation.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, id);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an affiliation
        */
        // --------------------------------------------------------------------------------
        [PUT("{affiliationId}")]
        public HttpResponseMessage Put(int affiliationId, InternationalAffiliationApiModel model)
        {
            if ((affiliationId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            try
            {
                var updateInternationalAffiliationCommand = Mapper.Map<UpdateInternationalAffiliation>(model);
                updateInternationalAffiliationCommand.UpdatedOn = DateTime.UtcNow;
                updateInternationalAffiliationCommand.Principal = User;
                _updateInternationalAffiliation.Handle(updateInternationalAffiliationCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "InternationalAffiliation update error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an affiliation
        */
        // --------------------------------------------------------------------------------
        [DELETE("{affiliationId}")]
        public HttpResponseMessage Delete(int affiliationId)
        {
            try
            {
                var deleteInternationalAffiliationCommand = new DeleteInternationalAffiliation(User, affiliationId);
                _deleteInternationalAffiliation.Handle(deleteInternationalAffiliationCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "InternationalAffiliation delete error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
