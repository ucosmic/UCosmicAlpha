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

        [GET("agreements/{agreementId:int}/contacts")]
        public AgreementApiModel Get(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            //if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            //var model = Mapper.Map<AgreementApiModel>(entity);
            //return model;
            return null;
        }
    }
}
