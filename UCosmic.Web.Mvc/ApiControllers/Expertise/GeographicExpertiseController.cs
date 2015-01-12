using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using MoreLinq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.GeographicExpertise;
using UCosmic.Repositories;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/geographic-expertise")]
    public class GeographicExpertiseController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateDeepGeographicExpertise> _createDeepGeographicExpertise;
        private readonly IHandleCommands<DeleteGeographicExpertise> _deleteGeographicExpertise;
        private readonly IHandleCommands<UpdateGeographicExpertise> _updateGeographicExpertise;

        public GeographicExpertiseController(IProcessQueries queryProcessor
                                  , IHandleCommands<CreateDeepGeographicExpertise> createDeepGeographicExpertise
                                  , IHandleCommands<DeleteGeographicExpertise> deleteGeographicExpertise
                                  , IHandleCommands<UpdateGeographicExpertise> updateGeographicExpertise)
        {
            _queryProcessor = queryProcessor;
            _createDeepGeographicExpertise = createDeepGeographicExpertise;
            _deleteGeographicExpertise = deleteGeographicExpertise;
            _updateGeographicExpertise = updateGeographicExpertise;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of expertises
        */
        // --------------------------------------------------------------------------------
        [Authorize]
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
         * Get an expertise
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [GET("{expertiseId:int}", ControllerPrecedence = 1)]
        public GeographicExpertiseApiModel Get(int expertiseId)
        {
            var expertise = _queryProcessor.Execute(new GeographicExpertiseById(expertiseId));
            if (expertise == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<GeographicExpertiseApiModel>(expertise);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an expertise
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [POST("")]
        public HttpResponseMessage Post(GeographicExpertiseApiModel model)
        {
            if (model == null || model.Locations == null || !model.Locations.Any())
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var newLocations = new Collection<int>();
            foreach (var location in model.Locations)
            {
                newLocations.Add(location.PlaceId);
            }
            var createDeepGeographicExpertiseCommand = new CreateDeepGeographicExpertise(User, newLocations)
            {
                Description = model.Description
            };
            _createDeepGeographicExpertise.Handle(createDeepGeographicExpertiseCommand);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Geographic expertise was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "GeographicExpertise",
                action = "Get",
                expertiseId = createDeepGeographicExpertiseCommand.CreatedGeographicExpertiseId,
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
        [Authorize]
        [PUT("{expertiseId:int}")]
        public HttpResponseMessage Put(int expertiseId, GeographicExpertiseApiModel model)
        {
            if (expertiseId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            //try
            //{
            var updateGeographicExpertiseCommand = Mapper.Map<UpdateGeographicExpertise>(model);
            updateGeographicExpertiseCommand.UpdatedOn = DateTime.UtcNow;
            updateGeographicExpertiseCommand.Principal = User;
            _updateGeographicExpertise.Handle(updateGeographicExpertiseCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "GeographicExpertise update error"
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
        [Authorize]
        [DELETE("{expertiseId:int}")]
        public HttpResponseMessage Delete(int expertiseId)
        {
            //try
            //{
            var deleteGeographicExpertiseCommand = new DeleteGeographicExpertise(User, expertiseId);
            _deleteGeographicExpertise.Handle(deleteGeographicExpertiseCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "GeographicExpertise delete error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        /* Returns Affiliation type counts for given place.*/
        [GET("Expertise-count/{establishmentId?}/{placeId?}")]
        //[CacheHttpGet(Duration = 3600)]
        public List<ExpertiseSummaryApiModel> GetExpertiseCount(int? establishmentId, int? placeId)
        {
            IList<ExpertiseSummaryApiModel> returnModel = new List<ExpertiseSummaryApiModel>();
            IList<ExpertiseSummaryApiQueryResultModel> model = new List<ExpertiseSummaryApiQueryResultModel>();

            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();

                    model = summaryRepository.ExpertiseSummaryByEstablishment_Place(establishmentId, placeId);
                    var modelDistinct = model.DistinctBy(x => new { x.ExpertiseId });

                    //ExpertiseTypes = ExpertiseTypesRepository.ExpertiseTypes_By_establishmentId(establishmentId);
                    var ExpertiseCount = modelDistinct.ToList().Count();
                    var locationCount = modelDistinct.DistinctBy(x => x.description).ToList().Count();
                    var personCount = modelDistinct.DistinctBy(x => x.personId).ToList().Count();
                    returnModel.Add(new ExpertiseSummaryApiModel { ExpertiseCount = ExpertiseCount, LocationCount = locationCount, PersonCount = personCount });
                }
            }
            return returnModel.ToList();
        }

    }
}
