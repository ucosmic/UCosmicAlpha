using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.InstitutionalAgreements;
using UCosmic.Web.Mvc.Models.Agreements;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class AgreementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{agreementId}")]
        public AgreementApiModel GetOne(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementApiModel>(entity);
            return model;
        }

        [GET("{agreementId}/participants")]
        public IEnumerable<AgreementParticipantApiModel> GetParticipants(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ParticipantsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<InstitutionalAgreementParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
                OrderBy = new Dictionary<Expression<Func<InstitutionalAgreementParticipant, object>>, OrderByDirection>
                {
                    { x => x.IsOwner, OrderByDirection.Descending },
                },
            });
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<AgreementParticipantApiModel[]>(entities);
            return models;
        }
    }
}
