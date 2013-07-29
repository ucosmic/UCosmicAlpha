using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements")]
    public class AgreementParticipantsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementParticipantsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{domain}/partners")]
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

        [GET("{domain}/partners/places/{placeType?}")]
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

        [GET("{agreementId:int}/participants")]
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

        [GET("{agreementId:int}/participant/{establishmentId}")]
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
