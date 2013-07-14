using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Web.Http;
using System.Net;
using System.Net.Http;
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
            
            var newPhone2 = new[]
            {
                new AgreementContactPhoneApiModel {Value = "3213456452", Type = "work", ContactId = "3" },
                new AgreementContactPhoneApiModel {Value = "321345", Type = "home", ContactId = "3" }
            };
            var newPhone1 = new[]
            {
                new AgreementContactPhoneApiModel {Value = "3213456452111", Type = "home", ContactId = "3" },
                new AgreementContactPhoneApiModel {Value = "321345111", Type = "work", ContactId = "3" }
            };
            models = new[]
            {
                new AgreementContactApiModel { Title = "job2", FirstName = "arya", LastName = "stark", Id = 2, PersonId = 44, Phones = newPhone2, EmailAddress = "asdf@as.as22", Type = "Home Principal", Suffix = "Sr.", Salutation = "Ms.", DisplayName = "Arya Stark", MiddleName = "middle2" },
                new AgreementContactApiModel { Title = "job3", FirstName = "Rob", LastName = "stark", Id = 2, PersonId = 45, Phones = newPhone1, EmailAddress = "111asdf@as.as22", Type = "Home Principal", Suffix = "Sr.", Salutation = "Mr.", DisplayName = "Rob Stark", MiddleName = "middle2" }
            };

            return models;
        }

        [GET("{agreementId:int}/contact/{contactId:int}")]
        public AgreementContactApiModel Get(int agreementId, int contactId)
        {
            var entities = _queryProcessor.Execute(new ContactsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementContact, object>>[]
                {
                    x => x.Person.Emails,
                    x => x.PhoneNumbers,
                }
            });

            var newPhone2 = new[]
            {
                new AgreementContactPhoneApiModel {Value = "3213456452", Type = "work", ContactId = "3"},
                new AgreementContactPhoneApiModel {Value = "321345", Type = "home", ContactId = "3"}
            };
            var models = new AgreementContactApiModel{ Title = "job2", FirstName = "arya", LastName = "stark", Id = 2, PersonId = 44, Phones = newPhone2, EmailAddress = "asdf@as.as22", Type = "Home Principal", Suffix = "Sr.", Salutation = "Ms.", DisplayName = "Arya Stark", MiddleName = "middle2" };


            return models;
        }

        [POST("{agreementId:int}/contact/{contactId:int}")]
        public HttpResponseMessage Post(int agreementId, int contactId)
        {
            var response = Request.CreateResponse(HttpStatusCode.Created,
               string.Format("Contact '{0}' was successfully created.", "name"));
            var url = Url.Link(null, new
            {
                controller = "AgreementContacts",
                action = "Get",
                agreementId,
                establishmentNameId = 1//command.Id
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{agreementId:int}/contact/{contactId:int}")]
        public HttpResponseMessage Put(int agreementId, int contactId)
        {

            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment name was successfully updated.");
            return response;
        }
    }
}
