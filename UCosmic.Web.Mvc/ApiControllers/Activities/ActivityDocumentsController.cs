using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Hosting;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using ImageResizer;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities")]
    public class ActivityDocumentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;
        private readonly IValidator<CreateActivityDocument> _createValidator;
        private readonly IHandleCommands<CreateActivityDocument> _createHandler;
        private readonly IHandleCommands<PurgeActivityDocument> _purgeHandler;
        private readonly IHandleCommands<RenameActivityDocument> _renameActivityDocument;

        public ActivityDocumentsController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
            , IValidator<CreateActivityDocument> createValidator
            , IHandleCommands<CreateActivityDocument> createHandler
            , IHandleCommands<PurgeActivityDocument> purgeHandler
            , IHandleCommands<RenameActivityDocument> renameActivityDocument
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _createValidator = createValidator;
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
            _renameActivityDocument = renameActivityDocument;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity documents
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId:int}/documents")]
        public IEnumerable<ActivityDocumentApiModel> GetDocuments(int activityId, string activityMode)
        {
            ActivityDocument[] documents = _queryProcessor.Execute(new ActivityDocumentsByActivityIdAndMode(activityId, activityMode));
            if (documents == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<ActivityDocumentApiModel[]>(documents);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get activity document
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId:int}/documents/{documentId:int}")]
        public ActivityDocumentApiModel GetDocuments(int activityId, int documentId)
        {
            throw new HttpResponseException(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Create activity document
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [POST("{activityId:int}/documents")]
        public HttpResponseMessage Post(int activityId, string activityMode, FileMedium fileMedium)
        {
            var activityValues = _queryProcessor.Execute(
                new ActivityValuesByActivityIdAndMode(activityId, activityMode));

            if (activityValues == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var command = new CreateActivityDocument(User)
            {
                ActivityValuesId = activityValues.RevisionId,
                Title = Path.GetFileNameWithoutExtension(fileMedium.FileName),
                Content = fileMedium.Content,
                MimeType = fileMedium.ContentType,
                FileName = fileMedium.FileName,
            };
            try
            {
                _createHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                Func<ValidationFailure, bool> forName = x => x.PropertyName == command.PropertyName(y => y.FileName);
                Func<ValidationFailure, bool> forContent = x => x.PropertyName == command.PropertyName(y => y.Content);
                if (ex.Errors.Any(forName))
                    return Request.CreateResponse(HttpStatusCode.UnsupportedMediaType,
                        ex.Errors.First(forName).ErrorMessage, "text/plain");
                if (ex.Errors.Any(forContent))
                    return Request.CreateResponse(HttpStatusCode.RequestEntityTooLarge,
                        ex.Errors.First(forContent).ErrorMessage, "text/plain");
            }
            return Request.CreateResponse(HttpStatusCode.Created);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update activity document
         * (Might need to use POST here)
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [PUT("{activityId:int}/documents/{documentId:int}")]
        public HttpResponseMessage PutDocument(int activityId, int documentId)
        {
            return Request.CreateResponse(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete activity document
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [DELETE("{activityId:int}/documents/{documentId:int}")]
        public HttpResponseMessage DeleteDocument(int activityId, int documentId)
        {
            //ActivityDocument activityDocument = this._queryProcessor.Execute(new ActivityDocumentById(documentId));

            var command = new PurgeActivityDocument(User, documentId);

            try
            {
                _purgeHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            }

            return Request.CreateResponse(HttpStatusCode.OK,
                string.Format("Activity document id '{0}' was successfully deleted.", documentId.ToString(CultureInfo.InvariantCulture)));
        }

        // --------------------------------------------------------------------------------
        /*
         * Rename activity document
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [PUT("{activityId:int}/documents/{documentId:int}/title")]
        public HttpResponseMessage PutDocumentsTitle(int activityId, int documentId, [FromBody] string newTitle)
        {
            var command = new RenameActivityDocument(User, documentId, newTitle);

            try
            {
                _renameActivityDocument.Handle(command);
            }
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            }

            return Request.CreateResponse(HttpStatusCode.OK,
                string.Format("Activity document id '{0}' was successfully renamed.", documentId.ToString(CultureInfo.InvariantCulture)));
        }

        // --------------------------------------------------------------------------------
        /*
         * Validate activity document type
        */
        // --------------------------------------------------------------------------------
        [Authorize]
        [POST("documents/validate-upload")]
        public HttpResponseMessage PostDocumentsValidateUploadFiletype([FromBody] FileUploadValidationModel model)
        {
            var command = new CreateActivityDocument(User)
            {
                FileName = model.Name,
                Content = model.Length.HasValue ? new byte[model.Length.Value] : new byte[0],
            };
            var validationResult = _createValidator.Validate(command);
            var forProperties = new List<Func<ValidationFailure, bool>>
            {
                x => x.PropertyName == command.PropertyName(y => y.FileName),
            };
            if (model.Length.HasValue)
                forProperties.Add(x => x.PropertyName == command.PropertyName(y => y.Content));
            foreach (var forProperty in forProperties)
                if (validationResult.Errors.Any(forProperty))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        validationResult.Errors.First(forProperty).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Get activity document proxy image
        */
        // --------------------------------------------------------------------------------
        [CacheHttpGet(Duration = 3600)]
        [GET("{activityId:int}/documents/{documentId:int}/thumbnail")]
        public HttpResponseMessage GetDocumentsThumbnail(int activityId, int documentId, [FromUri] ImageResizeRequestModel model)
        {
            var document = _queryProcessor.Execute(new ActivityDocumentById(documentId)
            {
                EagerLoad = new Expression<Func<ActivityDocument, object>>[]
                {
                    x => x.ActivityValues,
                },
            });
            if (document == null || document.ActivityValues.ActivityId != activityId)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
            var mimeType = "image/png";
            var settings = Mapper.Map<ResizeSettings>(model);

            // If the ActivityDocument has an image, resize and use.
            if (document.MimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                mimeType = document.MimeType;
                ImageBuilder.Current.Build(new MemoryStream(_binaryData.Get(document.Path)), stream, settings, true);
            }

            // If the ActivityDocument has no image, let's use the mime type image proxy.
            else
            {
                var fileExtension = Path.GetExtension(document.FileName);
                fileExtension = !string.IsNullOrWhiteSpace(fileExtension) ? fileExtension.Substring(1) : "unknown";
                var relativePath = string.Format("~/images/icons/files/{0}.png", fileExtension);
                if (!File.Exists(HostingEnvironment.MapPath(relativePath))) relativePath = "~/images/icons/files/unknown.png";
                ImageBuilder.Current.Build(relativePath, stream, settings);
            }

            stream.Position = 0;
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream), // will dispose the stream
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            return response;
        }
    }
}
