using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using Newtonsoft.Json;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements")]
    public class AgreementFilesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;
        private readonly IHandleCommands<CreateFile> _createFile;

        public AgreementFilesController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
            , IHandleCommands<CreateFile> createFile
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _createFile = createFile;
        }

        [GET("{agreementId:int}/files")]
        public IEnumerable<AgreementFileApiModel> Get(int agreementId, [FromUri] bool useTestData = false)
        {
            var entities = _queryProcessor.Execute(new FilesByAgreementId(User, agreementId));

            var models = Mapper.Map<AgreementFileApiModel[]>(entities);

            if (useTestData)
                models = new[]
                {
                    new AgreementFileApiModel { Id = 1, AgreementId = agreementId, OriginalName = "file1.pdf", CustomName = "file1.pdf", Visibility = "Public", },
                    new AgreementFileApiModel { Id = 2, AgreementId = agreementId, OriginalName = "file2.doc", CustomName = "file2.doc", Visibility = "Protected", },
                    new AgreementFileApiModel { Id = 3, AgreementId = agreementId, OriginalName = "file3.xls", CustomName = "file3.xls", Visibility = "Private", },
                };

            return models;
        }

        [GET("{agreementId:int}/files/{fileId:int}", ControllerPrecedence = 1)]
        public AgreementFileApiModel Get(int agreementId, int fileId, [FromUri] bool useTestData = false)
        {
            var entity = _queryProcessor.Execute(new FileById(User, fileId));
            if (entity == null || entity.AgreementId != agreementId)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<AgreementFileApiModel>(entity);

            if (useTestData)
                model = new AgreementFileApiModel
                {
                    Id = fileId,
                    AgreementId = agreementId,
                    OriginalName = "file1.pdf",
                    CustomName = "file1.pdf",
                    Visibility = "visible",
                };

            return model;
        }

        [GET("{agreementId:int}/files/{fileId:int}/content")]
        public HttpResponseMessage GetContent(int agreementId, int fileId)
        {
            var entity = _queryProcessor.Execute(new FileById(User, fileId));
            if (entity == null || entity.AgreementId != agreementId)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var fileName = entity.Name ?? entity.FileName;
            var file = _binaryData.Get(entity.Path);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(file),
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(fileName.GetContentType());
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
            {
                FileName = fileName,
            };
            return response;
        }

        [GET("{agreementId:int}/files/{fileId:int}/download")]
        public HttpResponseMessage GetDownload(int agreementId, int fileId)
        {
            var response = GetContent(agreementId, fileId);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = response.Content.Headers.ContentDisposition.FileName,
            };
            return response;
        }

        [POST("{agreementId:int}/files")]
        public HttpResponseMessage Post(int agreementId, AgreementFileApiModel model)
        {
            model.AgreementId = agreementId;
            var command = new CreateFile(User);
            Mapper.Map(model, command);

            //command.FileData = null;
            //command.UploadGuid = new Guid("ba5469dd-1fd2-434d-b126-1165be266a0b");
            //command.UploadGuid = new Guid("b31e77f8-43df-413b-b480-e37048aecf64");

            _createFile.Handle(command);

            var successPayload = new { message = string.Format("File '{0}' was successfully attached.", model.CustomName) };
            var successJson = JsonConvert.SerializeObject(successPayload);
            var response = Request.CreateResponse(HttpStatusCode.Created, successJson, "text/plain");
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
        public HttpResponseMessage Put(int agreementId, int fileId, AgreementFileApiModel model)
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
