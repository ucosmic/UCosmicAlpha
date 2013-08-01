using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
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
        private readonly IValidator<CreateFile> _createValidator;
        private readonly IHandleCommands<CreateFile> _createHandler;
        private readonly IHandleCommands<UpdateFile> _updateHandler;
        private readonly IHandleCommands<PurgeFile> _purgeHandler;

        public AgreementFilesController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
            , IValidator<CreateFile> createValidator
            , IHandleCommands<CreateFile> createHandler
            , IHandleCommands<UpdateFile> updateHandler
            , IHandleCommands<PurgeFile> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _createValidator = createValidator;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _purgeHandler = purgeHandler;
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
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Post(int agreementId, [FromBody] AgreementFileApiModel model)
        {
            model.AgreementId = agreementId;
            var command = new CreateFile(User)
            {
                FileData = model.FileMedium == null ? null : new CreateFile.FileDataWrapper
                {
                    FileName = model.FileMedium.FileName,
                    MimeType = model.FileMedium.ContentType,
                    Content = model.FileMedium.Content,
                },
            };
            Mapper.Map(model, command);

            try
            {
                _createHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                Func<ValidationFailure, bool> forName = x => x.PropertyName == command.PropertyName(y => y.FileData.FileName);
                Func<ValidationFailure, bool> forContent = x => x.PropertyName == command.PropertyName(y => y.FileData.Content);
                if (ex.Errors.Any(forName))
                    return Request.CreateResponse(HttpStatusCode.UnsupportedMediaType,
                        ex.Errors.First(forName).ErrorMessage, "text/plain");
                if (ex.Errors.Any(forContent))
                    return Request.CreateResponse(HttpStatusCode.RequestEntityTooLarge,
                        ex.Errors.First(forContent).ErrorMessage, "text/plain");
            }

            var url = Url.Link(null, new
            {
                controller = "AgreementFiles",
                action = "Get",
                agreementId,
                fileId = command.CreatedFileId,
            });
            Debug.Assert(url != null);
            var successPayload = new
            {
                message = string.Format("File '{0}' was successfully attached.", model.CustomName),
                location = url, // TODO: when IE8 dies, no need to do this (it is a workaround for kendo + IE only)
            };
            var successJson = JsonConvert.SerializeObject(successPayload);
            var response = Request.CreateResponse(HttpStatusCode.Created, successJson, "text/plain");
            response.Headers.Location = new Uri(url);
            return response;
        }

        [POST("files/validate")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage ValidatePost([FromBody] FileUploadValidationModel model)
        {
            var command = new CreateFile(User)
            {
                FileData = new CreateFile.FileDataWrapper
                {
                    FileName = model.Name,
                    Content = model.Length.HasValue ? new byte[model.Length.Value] : new byte[0],
                },
            };
            var validationResult = _createValidator.Validate(command);

            var forProperties = new List<Func<ValidationFailure, bool>>
            {
                x => x.PropertyName == command.PropertyName(y => y.FileData.FileName),
            };
            if (model.Length.HasValue)
                forProperties.Add(x => x.PropertyName == command.PropertyName(y => y.FileData.Content));
            foreach (var forProperty in forProperties)
                if (validationResult.Errors.Any(forProperty))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        validationResult.Errors.First(forProperty).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [PUT("{agreementId:int}/files/{fileId:int}")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Put(int agreementId, int fileId, [FromBody] AgreementFileApiModel model)
        {
            // PUT will only update the file's custom name and visibility properties
            model.AgreementId = agreementId;
            model.Id = fileId;
            var command = new UpdateFile(User);
            Mapper.Map(model, command);

            _updateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement file was successfully updated.");
            return response;
        }

        [DELETE("{agreementId:int}/files/{fileId:int}")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Delete(int agreementId, int fileId)
        {
            var command = new PurgeFile(User, agreementId, fileId);
            _purgeHandler.Handle(command);
            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement file was successfully deleted.");
            return response;
        }
    }
}
