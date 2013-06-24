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
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

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

        [GET("agreements/{domain}/places")]
        public IEnumerable<AgreementPlaceApiModel> GetPlaces(string domain)
        {
            return GetPlaceGroups(domain, null);
        }

        [GET("agreements/{domain}/places/{placeType}")]
        public IEnumerable<AgreementPlaceApiModel> GetPlaceGroups(string domain, string placeType)
        {
            var agreements = _queryProcessor.Execute(new AgreementsByOwnerDomain(User, domain)
            {
                EagerLoad = new Expression<Func<Agreement, object>>[]
                {
                    x => x.Participants.Select(y => y.Establishment.Location.Places.Select(z => z.GeoPlanetPlace))
                }
            });
            if (agreements == null || !agreements.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);

            var places = agreements.SelectMany(x => x.Participants).Where(x => !x.IsOwner)
                .Select(x => x.Establishment).Distinct()
                .SelectMany(x => x.Location.Places).Distinct()
                .OrderBy(x => x.OfficialName).ToArray();

            if ("continents".Equals(placeType))
                places = places.Where(x => x.IsContinent).ToArray();
            if ("countries".Equals(placeType))
                places = places.Where(x => x.IsCountry).ToArray();
            if ("points".Equals(placeType) || string.IsNullOrWhiteSpace(placeType))
            {
                var pointPlaces = new List<Place>();
                foreach (var nonOwnerParticipant in agreements.SelectMany(x => x.Participants).Where(x => !x.IsOwner))
                {
                    var location = nonOwnerParticipant.Establishment.Location;
                    var ancestorIds = location.Places.SelectMany(x => x.Ancestors).Select(x => x.AncestorId);
                    var pointPlace = location.Places.FirstOrDefault(x => !ancestorIds.Contains(x.RevisionId));
                    if (pointPlace != null && !pointPlaces.Select(x => x.RevisionId).Contains(pointPlace.RevisionId))
                        pointPlaces.Add(pointPlace);
                }
                places = pointPlaces.Distinct().ToArray();
            }

            var models = Mapper.Map<AgreementPlaceApiModel[]>(places);

            foreach (var model in models)
            {
                foreach (var agreement in agreements)
                {
                    var placeId = model.Id;
                    var ancestorIds = agreement.Participants.SelectMany(x => x.Establishment.Location.Places)
                        .SelectMany(x => x.Ancestors).Select(x => x.AncestorId).Distinct();
                    if (agreement.Participants.Where(x => !x.IsOwner)
                                 .SelectMany(x => x.Establishment.Location.Places)
                                 .Where(x => !ancestorIds.Contains(x.RevisionId))
                                 .Distinct().Any(x => x.RevisionId == placeId))
                        model.AgreementIds = new List<int>(model.AgreementIds) { agreement.Id }.ToArray();
                }
            }

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
