using System;
using System.Collections.Generic;
using System.Configuration;
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
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Files;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateActivity> _profileUpdateHandler;
        private readonly IValidator<CreateImage> _validateImage;
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IValidator<CreateLoadableFile> _validateLoadableFile;
        private readonly IHandleCommands<CreateLoadableFile> _createLoadableFile;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteActivityDocument;

        public ActivitiesController(IProcessQueries queryProcessor
                                  , IHandleCommands<UpdateActivity> profileUpdateHandler
                                  , IValidator<CreateImage> validateImage
                                  , IHandleCommands<CreateImage> createImage
                                  , IValidator<CreateLoadableFile> validateLoadableFile
                                  , IHandleCommands<CreateLoadableFile> createLoadableFile
                                  , IHandleCommands<CreateActivityDocument> createActivityDocument
                                  , IHandleCommands<DeleteActivityDocument> deleteActivityDocument )            
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _validateImage = validateImage;
            _createImage = createImage;
            _validateLoadableFile = validateLoadableFile;
            _createLoadableFile = createLoadableFile; 
            _createActivityDocument = createActivityDocument;
            _deleteActivityDocument = deleteActivityDocument;        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of activities
        */
        // --------------------------------------------------------------------------------
        [GET("page")]
        public PageOfActivityApiModel GetPage([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            ActivitiesByPersonIdMode query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonIdMode>(input);
            PagedQueryResult<Activity> activities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfActivityApiModel>(activities);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}")]
        public ActivityApiModel Get(int activityId)
        {
            Activity activity = _queryProcessor.Execute( new ActivityByEntityId(activityId) );
            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an activity
        */
        // --------------------------------------------------------------------------------
        [POST("{activityId}")]
        public HttpResponseMessage Post(int activityId)
        {
            return Request.CreateResponse(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}")]
        public HttpResponseMessage Put(int activityId)
        {
            return Request.CreateResponse(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an activity
        */
        // --------------------------------------------------------------------------------
        [DELETE("{activityId}")]
        public HttpResponseMessage Delete(int activityId)
        {
            return Request.CreateResponse(HttpStatusCode.NotImplemented);
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity documents
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/documents/{activityMode}")]
        public ICollection<ActivityDocumentApiModel> GetDocuments(int activityId, string activityMode)
        {
            ActivityDocument[] documents = _queryProcessor.Execute(new ActivityDocumentsByActivityIdAndMode(activityId, activityMode));
            var model = Mapper.Map<ICollection<ActivityDocumentApiModel>>(documents);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity locations
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/locations")]
         public ICollection<ActivityLocationNameApiModel> GetLocations(int activityId)
        {
            var activityPlaces = _queryProcessor.Execute(new FilteredPlaces
            {
                IsCountry = true,
                //IsBodyOfWater = true,
                IsEarth = true
            });

            var model = Mapper.Map<ActivityLocationNameApiModel[]>(activityPlaces);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all establishment institutions (category code 'INST')
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/institutions")]
        public ICollection<ActivityInstitutionApiModel> GetInstitutions(int activityId)
        {
            var institutions = _queryProcessor.Execute(new EstablishmentsByType("INST"));

            var model = Mapper.Map<ICollection<Establishment>, ICollection<ActivityInstitutionApiModel>>(institutions);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create activity document
        */
        // --------------------------------------------------------------------------------
        [POST("{activityId}/documents")]
        public Task<HttpResponseMessage> PostDocuments(int activityId)
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartMemoryStreamProvider();

            var task = Request.Content.ReadAsMultipartAsync(provider).
                ContinueWith<HttpResponseMessage>(t =>
                {
                    if (t.IsFaulted || t.IsCanceled)
                    {
                        Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                    }

                    foreach (var item in provider.Contents)
                    {
                        string mimeType = item.Headers.ContentType.MediaType;
                        string filename = item.Headers.ContentDisposition.FileName;
                        char[] trimChars = { '"' };
                        filename = filename.Trim(trimChars).WithoutTrailingSlash();
                        string name = Path.GetFileNameWithoutExtension(filename);
                        string extension = Path.GetExtension(filename);

                        if (!String.IsNullOrEmpty(extension))
                        {
                            extension = extension.Substring(1);
                        }
                        else
                        {
                            // TBD - convert mime type to file extension
                            Request.CreateResponse(HttpStatusCode.InternalServerError, "Unsupported file type.");
                        }

                        try
                        {
                            Stream stream = item.ReadAsStreamAsync().Result;
                            CreateActivityDocument activityDocumentCommand = null;

                            if (mimeType.Contains("image/"))
                            {
                                CreateImage createImageCommand = new CreateImage
                                {
                                    SourceStream = stream,
                                    Width = Int32.Parse(ConfigurationManager.AppSettings["ImageWidth"]),
                                    Height = Int32.Parse(ConfigurationManager.AppSettings["ImageHeight"]),
                                    Title = name,
                                    MimeType = mimeType,
                                    Name = name,
                                    Extension = extension,
                                    Size = stream.Length,
                                    Constrained = false
                                };

                                _createImage.Handle(createImageCommand);

                                activityDocumentCommand = new CreateActivityDocument
                                {
                                    ActivityValuesId = activityId,
                                    ImageId = createImageCommand.CreatedImage.Id,
                                    Mode = ActivityMode.AutoSave,
                                    Title = name
                                };
                            }
                            else
                            {
                                CreateLoadableFile createLoadableFileCommand = new CreateLoadableFile
                                {
                                    SourceStream = stream,
                                    Name = name,
                                    Extension = extension,
                                    MimeType = mimeType,
                                    Title = name
                                };

                                _createLoadableFile.Handle(createLoadableFileCommand);

                                activityDocumentCommand = new CreateActivityDocument
                                {
                                    ActivityValuesId = activityId,
                                    FileId = createLoadableFileCommand.CreatedLoadableFile.Id,
                                    Mode = ActivityMode.AutoSave,
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
         * Get activity document
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/documents/{documentId}")]
        public ActivityDocumentApiModel GetDocuments(int activityId, int documentId)
        {
            return null;
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
            ActivityDocument activityDocument = this._queryProcessor.Execute(new ActivityDocumentById(documentId));

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
                string.Format("Activity document id '{0}' was successfully deleted.", documentId.ToString()));
        }

        // --------------------------------------------------------------------------------
        /*
         * Validate activity document type
        */
        // --------------------------------------------------------------------------------
        [POST("{activityid}/validate-upload-filetype")]
        public HttpResponseMessage PostValidateUploadFiletype(int activityid, [FromBody] string extension)
        {
            CreateImage createImageCommand = new CreateImage { Extension = extension };
            var createImageValidationResult = _validateImage.Validate(createImageCommand);
            if (!createImageValidationResult.IsValid)
            {
                CreateLoadableFile createLoadableFileCommand = new CreateLoadableFile { Extension = extension };
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
        [GET("{activityId}/documents/{documentId}/thumbnail")]
        public HttpResponseMessage GetDocumentsThumbnail(int activityId, int documentId)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            ActivityDocument document = _queryProcessor.Execute(new ActivityDocumentById(documentId));
            byte[] contentData = null;

            /* If the ActivityDocument has an image, resize and use. */
            if (document.Image != null)
            {
                MemoryStream fullImageStream = new MemoryStream(document.Image.Data);
                System.Drawing.Image fullImage = System.Drawing.Image.FromStream(fullImageStream);
                Stream proxyStream = fullImage.ResizeImageConstrained(
                    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageHeight"]),
                    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                    System.Drawing.Imaging.ImageFormat.Png);

                System.Drawing.Image resizedImage = System.Drawing.Image.FromStream(proxyStream);

                MemoryStream stream = new MemoryStream();
                resizedImage.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                contentData = stream.ToArray();
            }
            /* If the ActivityDocument has no image, let's use the mime type image proxy. */
            else if (document.File != null)
            {
                Image dbImage = _queryProcessor.Execute(new ProxyImageByMimeType(document.File.MimeType));
                contentData = (dbImage != null) ? dbImage.Data : null;
            }

            /* Return the generic document proxy, if we haven't found one at this point. */
            if (contentData == null)
            {
                Image dbImage = _queryProcessor.Execute(new ImageByName("GenericDocument"));
                contentData = (dbImage != null) ? dbImage.Data : null;
            }

            if (contentData != null)
            {
                response.Content = new ByteArrayContent(contentData);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(ConfigurationManager.AppSettings["ProxyImageMimeType"]);
                response.StatusCode = HttpStatusCode.OK;
            }
            else
            {
                response.StatusCode = HttpStatusCode.NotFound;
            }

            return response;
        }
    }
}
