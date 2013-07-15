using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using ImageResizer;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Files;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/activities")]
    public class ActivityDocumentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;
        private readonly IValidator<CreateImage> _validateImage;
        private readonly IValidator<CreateLoadableActivityFile> _validateLoadableFile;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteActivityDocument;
        private readonly IHandleCommands<RenameActivityDocument> _renameActivityDocument;

        public ActivityDocumentsController(IProcessQueries queryProcessor
                                  , IStoreBinaryData binaryData
                                  , IValidator<CreateImage> validateImage
                                  , IValidator<CreateLoadableActivityFile> validateLoadableFile
                                  , IHandleCommands<CreateActivityDocument> createActivityDocument
                                  , IHandleCommands<DeleteActivityDocument> deleteActivityDocument
                                  , IHandleCommands<RenameActivityDocument> renameActivityDocument
                            )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _validateImage = validateImage;
            _validateLoadableFile = validateLoadableFile;
            _createActivityDocument = createActivityDocument;
            _deleteActivityDocument = deleteActivityDocument;
            _renameActivityDocument = renameActivityDocument;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity documents
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/documents")]
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
        [GET("{activityId}/documents/{documentId}")]
        public ActivityDocumentApiModel GetDocuments(int activityId, int documentId)
        {
            throw new HttpResponseException(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Create activity document
        */
        // --------------------------------------------------------------------------------
        [POST("{activityId}/documents")]
        public Task<HttpResponseMessage> PostDocuments(int activityId, string activityMode)
        {
            if (!Request.Content.IsMimeMultipartContent())
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            var activityValues = _queryProcessor.Execute(
                new ActivityValuesByActivityIdAndMode(activityId, activityMode));

            if (activityValues == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var provider = new MultipartMemoryStreamProvider();

            var task = Request.Content.ReadAsMultipartAsync(provider).ContinueWith(t =>
            {
                if (t.IsFaulted || t.IsCanceled)
                    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);

                foreach (var item in provider.Contents)
                {
                    var mimeType = item.Headers.ContentType.MediaType;
                    var fileName = item.Headers.ContentDisposition.FileName;
                    fileName = fileName.Trim('"').WithoutTrailingSlash();

                    var stream = item.ReadAsStreamAsync().Result;
                    var content = stream.ReadFully();
                    _createActivityDocument.Handle(new CreateActivityDocument(User)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        Title = Path.GetFileNameWithoutExtension(fileName),
                        Mode = activityMode.AsEnum<ActivityMode>(),
                        Content = content,
                        MimeType = mimeType,
                        FileName = fileName,
                    });
                }
                return Request.CreateResponse(HttpStatusCode.Created);
            });

            return task;
        }

        // --------------------------------------------------------------------------------
        /*
         * Update activity document
         * (Might need to use POST here)
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}/documents/{documentId}")]
        public HttpResponseMessage PutDocument(int activityId, int documentId)
        {
            return Request.CreateResponse(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete activity document
        */
        // --------------------------------------------------------------------------------
        [DELETE("{activityId}/documents/{documentId}")]
        public HttpResponseMessage DeleteDocument(int activityId, int documentId)
        {
            //ActivityDocument activityDocument = this._queryProcessor.Execute(new ActivityDocumentById(documentId));

            var command = new DeleteActivityDocument(User, documentId);

            try
            {
                _deleteActivityDocument.Handle(command);
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
        [PUT("{activityId}/documents/{documentId}/title")]
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
        [POST("{activityid}/documents/validate-upload-filetype")]
        public HttpResponseMessage PostDocumentsValidateUploadFiletype(int activityid, [FromBody] string fileName)
        {
            var createImageCommand = new CreateImage { FileName = fileName };
            var createImageValidationResult = _validateImage.Validate(createImageCommand);
            if (!createImageValidationResult.IsValid)
            {
                var createLoadableFileCommand = new CreateLoadableActivityFile { FileName = fileName };
                var createLoadableFileValidationResult = _validateLoadableFile.Validate(createLoadableFileCommand);
                if (!createLoadableFileValidationResult.IsValid)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        createLoadableFileValidationResult.Errors.First().ErrorMessage,
                        "text/plain");
                }
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Get activity document proxy image
        */
        // --------------------------------------------------------------------------------
        private static readonly object Lock = new object();
        [GET("{activityId}/documents/{documentId}/thumbnail")]
        public HttpResponseMessage GetDocumentsThumbnail(int activityId, int documentId, [FromUri] ImageResizeRequestModel model)
        {
            lock (Lock)
            {
                var document = _queryProcessor.Execute(new ActivityDocumentById(documentId)
                {
                    EagerLoad = new Expression<Func<ActivityDocument, object>>[]
                    {
                        x => x.ActivityValues,
                    }
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
}
