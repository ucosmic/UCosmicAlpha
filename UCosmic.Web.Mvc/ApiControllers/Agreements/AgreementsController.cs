using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using MoreLinq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;
using UCosmic.Repositories;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class AgreementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateAgreement> _createValidator;
        private readonly IValidator<PurgeAgreement> _purgeValidator;
        private readonly IHandleCommands<CreateAgreement> _createHandler;
        private readonly IHandleCommands<UpdateAgreement> _updateHandler;
        private readonly IHandleCommands<PurgeAgreement> _purgeHandler;

        public AgreementsController(IProcessQueries queryProcessor
            , IValidator<CreateAgreement> createValidator
            , IValidator<PurgeAgreement> purgeValidator
            , IHandleCommands<CreateAgreement> createHandler
            , IHandleCommands<UpdateAgreement> updateHandler
            , IHandleCommands<PurgeAgreement> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createValidator = createValidator;
            _purgeValidator = purgeValidator;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _purgeHandler = purgeHandler;
        }

        [GET("{domain}/agreements")]
        public HttpResponseMessage Get(string domain, [FromUri] AgreementSearchInputModel input)
        {
            //Thread.Sleep(2000);
            if (input.PageSize < 1 || input == null || string.IsNullOrWhiteSpace(domain))
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new AgreementsByKeyword(User, domain);
            Mapper.Map(input, query);

            var results = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfAgreementApiFlatModel>(results);

            if ("application/vnd.ms-excel".Equals(input.Accept, StringComparison.OrdinalIgnoreCase))
            {
                Request.Headers.Accept.Clear();
                Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.ms-excel"));
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, model);

            if (Request.Headers.Accept.Contains(new MediaTypeWithQualityHeaderValue("application/vnd.ms-excel"))||
                "application/vnd.ms-excel".Equals(input.Accept, StringComparison.OrdinalIgnoreCase))
            {
                Request.Headers.Accept.Clear();
                Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.ms-excel"));
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.ms-excel");
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = "UCosmicAgreementData.xlsx",
                };
            }

            return response;
            //return model;
        }

        [GET("agreements/{agreementId:int}")]
        public AgreementApiModel Get(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementApiModel>(entity);
            return model;
        }

        [GET("{domain}/agreements/visibility")]
        public string GetVisibility(string domain)
        {
            var query = new MyAgreementsVisibility(User, domain);
            var visibility = _queryProcessor.Execute(query);
            return visibility.AsSentenceFragment();
        }

        [GET("{domain}/agreements/summaryTable/{countryCode}/{typeCode}/{keyword}")]
        public AgreementsSummary GetSummaryTable(string domain, string countryCode, string typeCode, string keyword)
        {
            var query = new MyAgreementsSummary(User, domain, countryCode, typeCode, keyword, null);
            var summary = _queryProcessor.Execute(query);
            return summary;
        }
        [GET("{domain}/agreements/summaryMap/{countryCode}/{typeCode}/{continentCode}")]
        public AgreementsSummary GetSummaryMap(string domain, string countryCode, string typeCode, string continentCode)
        {
            var query = new MyAgreementsSummary(User, domain, countryCode, typeCode,null, continentCode);
            var summary = _queryProcessor.Execute(query);
            return summary;
        }

        [GET("{domain}/agreements/summary")]
        public AgreementsSummary GetSummary(string domain)
        {
            
            var query = new MyAgreementsSummary(User, domain, "", "", "", "");
            var summary = _queryProcessor.Execute(query);
            return summary;
        }

        [GET("agreements/{agreementId:int}/visibility")]
        public string GetVisibility(int agreementId)
        {
            var query = new MyAgreementVisibility(User, agreementId);
            var visibility = _queryProcessor.Execute(query);
            return visibility.AsSentenceFragment();
        }

        [GET("agreements/{agreementId:int}/umbrellas")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public IEnumerable<TextValuePair> GetUmbrellaOptions(int agreementId)
        {
            var entities = _queryProcessor.Execute(new UmbrellaOptions(User, agreementId)
            {
                EagerLoad = new Expression<Func<Agreement, object>>[]
                {
                    x => x.Participants.Select(y => y.Establishment.Names.Select(z => z.TranslationToLanguage)),
                }
            });
            var models = Mapper.Map<IEnumerable<TextValuePair>>(entities)
                .OrderBy(x => x.Text);
            return models;
        }

        [POST("agreements")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Post(AgreementApiModel model)
        {
            var command = new CreateAgreement(User);
            Mapper.Map(model, command);
            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Agreement was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Agreements",
                action = "Get",
                agreementId = command.CreatedAgreementId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [POST("agreements/validate")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage PostValidate(AgreementApiModel model)
        {
            var command = new CreateAgreement(User);
            Mapper.Map(model, command);
            var validationResult = _createValidator.Validate(command);

            if (!validationResult.IsValid)
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    Mapper.Map<ValidationResultApiModel>(validationResult));

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [PUT("agreements/{agreementId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Put(int agreementId, AgreementApiModel model)
        {
            model.Id = agreementId;
            var command = new UpdateAgreement(User, agreementId);
            Mapper.Map(model, command);

            _updateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement was successfully updated.");
            return response;
        }

        [DELETE("agreements/{agreementId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Delete(int agreementId)
        {
            var command = new PurgeAgreement(User, agreementId);
            var validation = _purgeValidator.Validate(command);
            if (!validation.IsValid)
            {
                var firstError = validation.Errors.Select(x => x.ErrorMessage).First();
                return Request.CreateResponse(HttpStatusCode.BadRequest, firstError, "text/plain");
            }
            _purgeHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement was successfully deleted.");
            return response;
        }


        /* Returns agreement type counts for given place.*/
        [GET("agreements/agreement-count/{establishmentId?}/{placeId?}/{selectedEstablishmentId?}")]
        //[CacheHttpGet(Duration = 3600)]
        public List<AgreementSummaryApiModel> GetAgreementCount(int? establishmentId, int? placeId, int? selectedEstablishmentId)
        {
            IList<AgreementSummaryApiModel> returnModel = new List<AgreementSummaryApiModel>();
            IList<AgreementSummaryApiQueryResultModel> model = new List<AgreementSummaryApiQueryResultModel>();
            //IList<AgreementTypesApiReturn> agreementTypes = new List<AgreementTypesApiReturn>();

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
                    AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
                    model = summaryRepository.AgreementSummaryByEstablishment_Place(establishmentId, placeId, selectedEstablishmentId);
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.type } );
                    //agreementTypes = AgreementTypesRepository.AgreementTypes_By_establishmentId(establishmentId);
                    var agreementTypes = modelDistinct.DistinctBy(x => x.type );
                    foreach (var type in agreementTypes)
                    {
                        var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
                        var locationCount = model.Where(x => x.type == type.type).Count();
                        returnModel.Add(new AgreementSummaryApiModel { LocationCount = locationCount, TypeCount = typeCount, Type = type.type, TypeId = type.id });
                    }
                }
            }
            return returnModel.ToList();
        }



        /* Returns agreement type counts for given place.*/
        [GET("agreements/agreement-types/{establishmentId?}/")]
        //[CacheHttpGet(Duration = 3600)]
        public List<AgreementTypesApiReturn> GetAgreementTypes(int? establishmentId)
        {
            //IList<AgreementSummaryApiModel> returnModel = new List<AgreementSummaryApiModel>();
            //IList<AgreementSummaryApiQueryResultModel> model = new List<AgreementSummaryApiQueryResultModel>();
            IList<AgreementTypesApiReturn> agreementTypes = new List<AgreementTypesApiReturn>();

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

                    //SummaryRepository summaryRepository = new SummaryRepository();
                    AgreementTypesRepository agreementTypesRepository = new AgreementTypesRepository();
                    //model = summaryRepository.AgreementLocationsByEstablishment_Place(establishmentId, placeId);
                    //var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                agreementTypes = agreementTypesRepository.AgreementTypes_By_establishmentId(establishmentId);
                    //var agreementTypes = modelDistinct.DistinctBy(x => x.type);
            }
            return agreementTypes.ToList();
        }
    }
}
