using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements")]
    public class AgreementContactsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementContactsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{agreementId:int}/contacts")]
        public IEnumerable<AgreementContactApiModel> Get(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ContactsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementContact, object>>[]
                {
                    x => x.Person.Emails,
                    x => x.PhoneNumbers,
                }
            });
            var models = Mapper.Map<AgreementContactApiModel[]>(entities);
            return models;
        }
    }
}
