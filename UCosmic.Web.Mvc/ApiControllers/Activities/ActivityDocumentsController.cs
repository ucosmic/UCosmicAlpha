using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
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
        private readonly IValidator<CreateImage> _validateImage;
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IValidator<CreateLoadableActivityFile> _validateLoadableFile;
        private readonly IHandleCommands<CreateLoadableActivityFile> _createLoadableFile;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteActivityDocument;
        private readonly IHandleCommands<RenameActivityDocument> _renameActivityDocument;

        public ActivityDocumentsController(IProcessQueries queryProcessor
                                  , IValidator<CreateImage> validateImage
                                  , IHandleCommands<CreateImage> createImage
                                  , IValidator<CreateLoadableActivityFile> validateLoadableFile
                                  , IHandleCommands<CreateLoadableActivityFile> createLoadableFile
                                  , IHandleCommands<CreateActivityDocument> createActivityDocument
                                  , IHandleCommands<DeleteActivityDocument> deleteActivityDocument 
                                  , IHandleCommands<RenameActivityDocument> renameActivityDocument
                            )
        {
            _queryProcessor = queryProcessor;
            _validateImage = validateImage;
            _createImage = createImage;
            _validateLoadableFile = validateLoadableFile;
            _createLoadableFile = createLoadableFile; 
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
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            //Activity activity = _queryProcessor.Execute(new ActivityById(activityId));
            //if (activity == null)
            //{
            //    //string message = string.Format("Activity Id {0} not found", activityId);
            //    //return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, message);
            //    throw new HttpResponseException(HttpStatusCode.InternalServerError);
            //}

            ActivityValues activityValues =
                _queryProcessor.Execute(new ActivityValuesByActivityIdAndMode(activityId, activityMode));

            if (activityValues == null)
            {
                //string message = string.Format("Activity Id {0} not found", activityId);
                //return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, message);
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            var provider = new MultipartMemoryStreamProvider();

            var task = Request.Content.ReadAsMultipartAsync(provider).
                ContinueWith(t =>
                {
                    if (t.IsFaulted || t.IsCanceled)
                    {
                        return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                    }

                    //Activity activity = _queryProcessor.Execute(new ActivityById(activityId));
                    //if (activity == null)
                    //{
                    //    string message = string.Format("Activity Id {0} not found", activityId);
                    //    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, message);
                    //}

                    foreach (var item in provider.Contents)
                    {
                        string mimeType = item.Headers.ContentType.MediaType;
                        string filename = item.Headers.ContentDisposition.FileName;
                        char[] trimChars = { '"' };
                        filename = filename.Trim(trimChars).WithoutTrailingSlash();
                        string name = Path.GetFileNameWithoutExtension(filename);
                        //string extension = Path.GetExtension(filename);

                        //if (!String.IsNullOrEmpty(extension))
                        //{
                        //    extension = extension.Substring(1);
                        //}
                        //else
                        //{
                        //    // TBD - convert mime type to file extension
                        //    throw new HttpResponseException(HttpStatusCode.InternalServerError);
                        //}

                        try
                        {
                            Stream stream = item.ReadAsStreamAsync().Result;
                            CreateActivityDocument activityDocumentCommand;

                            if (mimeType.Contains("image/"))
                            {
                                var createImageCommand = new CreateImage
                                {
                                    Content = stream.ReadFully(),
                                    //Width = Int32.Parse(ConfigurationManager.AppSettings["ImageWidth"]),
                                    //Height = Int32.Parse(ConfigurationManager.AppSettings["ImageHeight"]),
                                    Title = name,
                                    MimeType = mimeType,
                                    //Name = name,
                                    //Extension = extension,
                                    FileName = filename,
                                    //Size = stream.Length,
                                    //Constrained = false
                                };

                                _createImage.Handle(createImageCommand);

                                activityDocumentCommand = new CreateActivityDocument(User)
                                {
                                    ActivityValuesId = activityValues.RevisionId,
                                    ImageId = createImageCommand.CreatedImage.Id,
                                    Mode = activityMode.AsEnum<ActivityMode>(),
                                    Title = name
                                };
                            }
                            else
                            {
                                var createLoadableFileCommand = new CreateLoadableActivityFile
                                {
                                    Content = stream.ReadFully(),
                                    FileName = filename,
                                    MimeType = mimeType,
                                    Title = name
                                };

                                _createLoadableFile.Handle(createLoadableFileCommand);

                                activityDocumentCommand = new CreateActivityDocument(User)
                                {
                                    ActivityValuesId = activityValues.RevisionId,
                                    FileId = createLoadableFileCommand.CreatedLoadableFile.Id,
                                    Mode = activityMode.AsEnum<ActivityMode>(),
                                    Title = name
                                };
                            }

                            _createActivityDocument.Handle(activityDocumentCommand);
                        }
                        catch (Exception ex)
                        {
                            Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                        }

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
                //var response = new HttpResponseMessage();
                ActivityDocument document = _queryProcessor.Execute(new ActivityDocumentById(documentId));
                if (document == null) throw new HttpResponseException(HttpStatusCode.NotFound);
                //byte[] contentData;

                var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
                var mimeType = "image/png";
                var settings = Mapper.Map<ResizeSettings>(model);

                // If the ActivityDocument has an image, resize and use.
                if (document.Image != null)
                {
                    mimeType = document.Image.MimeType;
                    ImageBuilder.Current.Build(new MemoryStream(document.Image.Content), stream, settings, true);
                    //var fullImageStream = new MemoryStream(document.Image.Content);
                    //System.Drawing.Image fullImage = System.Drawing.Image.FromStream(fullImageStream);
                    //Stream proxyStream = fullImage.ResizeImageConstrained(
                    //    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageHeight"]),
                    //    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                    //    System.Drawing.Imaging.ImageFormat.Png);
                    //
                    //System.Drawing.Image resizedImage = System.Drawing.Image.FromStream(proxyStream);
                    //
                    //var stream = new MemoryStream();
                    //resizedImage.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                    //contentData = stream.ToArray();
                }

                // If the ActivityDocument has no image, let's use the mime type image proxy.
                else if (document.File != null)
                {
                    var fileExtension = Path.GetExtension(document.File.FileName);
                    fileExtension = !string.IsNullOrWhiteSpace(fileExtension) ? fileExtension.Substring(1) : "unknown";
                    var relativePath = string.Format("~/images/icons/files/{0}.png", fileExtension);
                    ImageBuilder.Current.Build(relativePath, stream, settings);

                    //Image dbImage = _queryProcessor.Execute(new ProxyImageByMimeType(document.File.MimeType));
                    //contentData = (dbImage != null) ? dbImage.Content : null;
                }

                // Return the generic document proxy, if we haven't found one at this point.
                //if (contentData == null)
                //{
                //    Image dbImage = _queryProcessor.Execute(new ImageByName("GenericDocument"));
                //    contentData = (dbImage != null) ? dbImage.Content : null;
                //}

                stream.Position = 0;
                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StreamContent(stream), // will dispose the stream
                };
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
                return response;

                //if (contentData != null)
                //{
                //    response.Content = new ByteArrayContent(contentData);
                //    response.Content.Headers.ContentType = new MediaTypeHeaderValue(ConfigurationManager.AppSettings["ProxyImageMimeType"]);
                //    response.StatusCode = HttpStatusCode.OK;
                //}
                //else
                //{
                //    response.StatusCode = HttpStatusCode.NotFound;
                //}
                //
                //return response;
            }
        }
    }
}
