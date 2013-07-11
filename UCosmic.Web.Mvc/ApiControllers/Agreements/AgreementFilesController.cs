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
    public class AgreementFilesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementFilesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{agreementId:int}/files")]
        public IEnumerable<AgreementFileApiModel> Get(int agreementId)
        {
            //var entities = _queryProcessor.Execute(new FilesByAgreementId(User, agreementId)
            //{
            //    EagerLoad = new Expression<Func<AgreementFile, object>>[]
            //    {
            //        x => x.Person.Emails,
            //        x => x.PhoneNumbers,
            //    }
            //});

            //var models = Mapper.Map<AgreementFileApiModel[]>(entities);
            
            var models = new[]
            {
                new AgreementFileApiModel { AgreementId = "1", Name = "file1", Path = "Path1", Visibility = "Public"},
                new AgreementFileApiModel { AgreementId = "2", Name = "file2", Path = "Path2", Visibility = "Protected"},
                new AgreementFileApiModel { AgreementId = "3", Name = "file3", Path = "Path3", Visibility = "Private"},
            };

            return models;
        }

        [GET("{agreementId:int}/files/{fileId:int}")]
        public AgreementFileApiModel Get(int agreementId, int fileId)
        {
            //var entities = _queryProcessor.Execute(new FilesByAgreementId(User, agreementId)
            //{
            //    EagerLoad = new Expression<Func<AgreementFile, object>>[]
            //    {
            //        x => x.Person.Emails,
            //        x => x.PhoneNumbers,
            //    }
            //});

            var model = new AgreementFileApiModel
            {
                AgreementId = "1",
                Name = "file1",
                Path = "Path1",
                Visibility = "visible"
            };


            return model;
        }

        [POST("{agreementId:int}/files")]
        public HttpResponseMessage Post(int agreementId, int fileId)
        {
            var response = Request.CreateResponse(HttpStatusCode.Created,
               string.Format("File '{0}' was successfully created.", "name"));
            var url = Url.Link(null, new
            {
                controller = "AgreementFiles",
                action = "Get",
                agreementId,
                establishmentNameId = 1//command.Id
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{agreementId:int}/files/{fileId:int}")]
        public HttpResponseMessage Put(int agreementId, int fileId)
        {

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement file was successfully updated.");
            return response;
        }

        [DELETE("{agreementId:int}/files/{fileId:int}")]
        public HttpResponseMessage Delete(int agreementId, int fileId)
        {

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement file was successfully deleted.");
            return response;
        }
    }
}
