using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
    public class AgreementPartnersController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementPartnersController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{agreementId:int}/partners")]
        public IEnumerable<AgreementParticipantApiModel> GetPartners(int agreementId)
        {
            var query = new ParticipantsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Location,
                    x => x.Establishment.Names.Select(y => y.TranslationToLanguage),
                }
            };
            var participants = _queryProcessor.Execute(query).Where(x => !x.IsOwner);

            // convert to model
            var models = Mapper.Map<AgreementParticipantApiModel[]>(participants);

            return models;
        }

        [GET("{domain}/partners")]
        public IEnumerable<AgreementParticipantApiModel> GetPartners(string domain, [FromUri] IEnumerable<int> agreementIds = null)
        {
            var query = new PartnerParticipantsByOwnerDomain(User, domain)
            {
                AgreementIds = agreementIds,
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Location,
                    x => x.Establishment.Names.Select(y => y.TranslationToLanguage),
                },
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
    }
}
