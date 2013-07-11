using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
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
                new AgreementFileApiModel { Id = 1, AgreementId = agreementId, OriginalName = "file1.pdf", CustomName = "file1.pdf", Visibility = "Public", },
                new AgreementFileApiModel { Id = 2, AgreementId = agreementId, OriginalName = "file2.doc", CustomName = "file2.doc", Visibility = "Protected", },
                new AgreementFileApiModel { Id = 3, AgreementId = agreementId, OriginalName = "file3.xls", CustomName = "file3.xls", Visibility = "Private", },
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
                Id = fileId,
                AgreementId = agreementId,
                OriginalName = "file1.pdf",
                CustomName = "file1.pdf",
                Visibility = "visible"
            };

            return model;
        }

        [POST("{agreementId:int}/files")]
        public HttpResponseMessage Post(int agreementId, AgreementFileApiModel model)
        {
            var response = Request.CreateResponse(HttpStatusCode.Created,
               string.Format("File '{0}' was successfully attached.", model.CustomName));
            var url = Url.Link(null, new
            {
                controller = "AgreementFiles",
                action = "Get",
                agreementId,
                fileId = 1,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{agreementId:int}/files/{fileId:int}")]
        public HttpResponseMessage Put(int agreementId, AgreementFileApiModel model)
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
