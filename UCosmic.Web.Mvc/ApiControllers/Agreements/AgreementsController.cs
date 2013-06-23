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
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;
using UCosmic.Web.Mvc.Models.Agreements;

namespace UCosmic.Web.Mvc.ApiControllers
{
    //[DefaultApiHttpRouteConvention]
    [RoutePrefix("api")]
    public class AgreementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
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

        [GET("agreements/{agreementId}/participants")]
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

        [GET("agreements/{agreementId}/participant/{establishmentId}")]
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
