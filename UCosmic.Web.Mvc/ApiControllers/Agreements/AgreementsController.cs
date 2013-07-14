using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Identity;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    //[DefaultApiHttpRouteConvention]
    [RoutePrefix("api")]
    public class AgreementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateAgreement> _createValidator;

        public AgreementsController(IProcessQueries queryProcessor
            , IValidator<CreateAgreement> createValidator
        )
        {
            _queryProcessor = queryProcessor;
            _createValidator = createValidator;
        }

        [GET("agreements/{agreementId:int}")]
        public AgreementApiModel GetOne(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementApiModel>(entity);
            return model;
        }

        [GET("agreements/{domain}")]
        public IEnumerable<AgreementApiModel> Get(string domain)
        {
            // use domain parameter, but fall back to style cookie if not passed.
            var tenancy = Request.Tenancy() ?? new Tenancy { StyleDomain = "default" };
            domain = string.IsNullOrWhiteSpace(domain)
                ? tenancy.StyleDomain : domain;

            if ("default".Equals(domain) || string.IsNullOrWhiteSpace(domain))
            {
                // fall back again to user default affiliation
                var defaultAffliation = _queryProcessor.Execute(new MyDefaultAffiliation(User));
                if (defaultAffliation != null)
                    domain = defaultAffliation.WebsiteUrl;
            }

            var entities = _queryProcessor.Execute(new AgreementsByOwnerDomain(User, domain));
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<AgreementApiModel[]>(entities);
            return models;
        }

        [POST("agreements")]
        public HttpResponseMessage Post(AgreementApiModel model)
        {
            //var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            //if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            //var model = Mapper.Map<AgreementApiModel>(entity);
            //return model;
            return null;
        }

        [POST("agreements/validate")]
        public HttpResponseMessage Validate(AgreementApiModel model)
        {
            var command = new CreateAgreement(User);
            Mapper.Map(model, command);
            var validationResult = _createValidator.Validate(command);

            if (!validationResult.IsValid)
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    Mapper.Map<ValidationResultApiModel>(validationResult));

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [GET("agreements/{domain}/partners")]
        public IEnumerable<AgreementParticipantApiModel> GetPartners(string domain)
        {
            var query = new PartnerParticipantsByOwnerDomain(User, domain)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Location,
                    x => x.Establishment.Names.Select(y => y.TranslationToLanguage),
                }
            };
            var partners = _queryProcessor.Execute(query);

            // convert to model
            var models = Mapper.Map<AgreementParticipantApiModel[]>(partners);

            return models;
        }

        [GET("agreements/{domain}/partners/places/{placeType?}")]
        public IEnumerable<AgreementPlaceApiModel> GetPartnerPlaces(string domain, string placeType = null)
        {
            var query = new PartnerPlacesByOwnerDomain(User, domain)
            {
                EagerLoad = new Expression<Func<Place, object>>[]
                {
                    x => x.GeoPlanetPlace.Type,
                    //x => x.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace.Type),
                },
                OrderBy = new Dictionary<Expression<Func<Place, object>>, OrderByDirection>
                {
                    { x => x.OfficialName, OrderByDirection.Ascending },
                },
            };
            if ("countries".Equals(placeType, StringComparison.OrdinalIgnoreCase))
                query.GroupBy = PlaceGroup.Countries;
            if ("continents".Equals(placeType, StringComparison.OrdinalIgnoreCase))
                query.GroupBy = PlaceGroup.Continents;
            var places = _queryProcessor.Execute(query);

            // convert to model
            var models = Mapper.Map<AgreementPlaceApiModel[]>(places);

            return models;
        }

        [GET("agreements/{agreementId:int}/participants")]
        public IEnumerable<AgreementParticipantApiModel> GetParticipants(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ParticipantsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
                OrderBy = new Dictionary<Expression<Func<AgreementParticipant, object>>, OrderByDirection>
                {
                    { x => x.IsOwner, OrderByDirection.Descending },
                },
            });
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<AgreementParticipantApiModel[]>(entities);
            return models;
        }

        [GET("agreements/{agreementId:int}/participant/{establishmentId}")]
        public AgreementParticipantApiModel GetParticipant(int agreementId, int establishmentId)
        {
            var entity = _queryProcessor.Execute(new ParticipantByEstablishmentId(User, establishmentId, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementParticipantApiModel>(entity);
            return model;
        }
    }
}
