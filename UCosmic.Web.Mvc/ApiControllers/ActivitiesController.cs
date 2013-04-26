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
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;
using Image = UCosmic.Domain.Files.Image;

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
        private readonly IHandleCommands<RenameActivityDocument> _renameActivityDocument;
        private readonly IHandleCommands<CopyDeepActivity> _copyDeepActivity;
        private readonly IHandleCommands<CreateDeepActivity> _createDeepActivity;
        private readonly IHandleCommands<DeleteActivity> _deleteActivity;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;

        public ActivitiesController(IProcessQueries queryProcessor
                                  , IHandleCommands<UpdateActivity> profileUpdateHandler
                                  , IValidator<CreateImage> validateImage
                                  , IHandleCommands<CreateImage> createImage
                                  , IValidator<CreateLoadableFile> validateLoadableFile
                                  , IHandleCommands<CreateLoadableFile> createLoadableFile
                                  , IHandleCommands<CreateActivityDocument> createActivityDocument
                                  , IHandleCommands<DeleteActivityDocument> deleteActivityDocument 
                                  , IHandleCommands<RenameActivityDocument> renameActivityDocument
                                  , IHandleCommands<CopyDeepActivity> copyDeepActivity
                                  , IHandleCommands<CreateDeepActivity> createDeepActivity
                                  , IHandleCommands<DeleteActivity> deleteActivity
                                  , IHandleCommands<UpdateActivity> updateActivity )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _validateImage = validateImage;
            _createImage = createImage;
            _validateLoadableFile = validateLoadableFile;
            _createLoadableFile = createLoadableFile; 
            _createActivityDocument = createActivityDocument;
            _deleteActivityDocument = deleteActivityDocument;
            _renameActivityDocument = renameActivityDocument;
            _copyDeepActivity = copyDeepActivity;
            _createDeepActivity = createDeepActivity;
            _deleteActivity = deleteActivity;
            _updateActivity = updateActivity;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of activities
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfActivityApiModel Get([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonId>(input);
            var activities = _queryProcessor.Execute(query);
            if (activities == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

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
            var activity = _queryProcessor.Execute( new ActivityByEntityId(activityId) );
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity copy for editing (or recover edit copy)
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/edit")]
        public ActivityApiModel GetEdit(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            /* Search for an "in progress edit" activity.  This can happen if the user
             * navigates away from Activity Edit page before saving. */
            var editActivity = _queryProcessor.Execute(new ActivityByEditSourceId(activity.RevisionId));
            if (editActivity == null)
            {
                try
                {
                /* There's no "in progress edit" record, so we make a copy of the
                     * activity and set it to edit mode. */
                    var copyDeepActivityCommand = new CopyDeepActivity(activity.RevisionId,
                                                                       activity.Mode,
                                                                       activity.RevisionId);

                    _copyDeepActivity.Handle(copyDeepActivityCommand);

                    editActivity = copyDeepActivityCommand.CreatedActivity;
                }
                catch (Exception ex)
                {
                    var responseMessage = new HttpResponseMessage
                    {
                        StatusCode = HttpStatusCode.InternalServerError,
                        Content = new StringContent(ex.Message),
                        ReasonPhrase = "Error preparing activity for edit"
                    };
                    throw new HttpResponseException(responseMessage);
                }
            }

            var model = Mapper.Map<ActivityApiModel>(editActivity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity's edit state.
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/edit-state")]
        public ActivityEditState GetEditState(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var editState = new ActivityEditState();

            editState.IsInEdit = activity.EditSourceId.HasValue;

            // TBD
            editState.EditingUserName = "";
            editState.EditingUserEmail = "";

            return editState;
        }


        // --------------------------------------------------------------------------------
        /*
         * Create an activity
        */
        // --------------------------------------------------------------------------------
        [POST("")]
        public HttpResponseMessage Post()
        {
            var createDeepActivityCommand =
                new CreateDeepActivity(_queryProcessor.Execute(new UserByName(User.Identity.Name)),
                                       ActivityMode.Draft.AsSentenceFragment());
            _createDeepActivity.Handle(createDeepActivityCommand);

            var model = createDeepActivityCommand.CreatedActivity.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}")]
        public HttpResponseMessage Put(int activityId, ActivityApiModel model)
        {
            if ((activityId == 0) || (model == null)) return Request.CreateResponse(HttpStatusCode.InternalServerError);

            var activity = Mapper.Map<Activity>(model);
            try
            {
                var updateActivityCommand = new UpdateActivity(User,
                                                               activity.RevisionId,
                                                               DateTime.Now,
                                                               activity.ModeText)
                {
                    Values = activity.Values.SingleOrDefault(x => x.ModeText == activity.ModeText)
                };
                _updateActivity.Handle(updateActivityCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "Activity update error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity, copying the Edit mode Activity to corresponding non-Edit
         * mode Activity.  The activityId must be of that of an Activity in "edit mode".
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}/edit")]
        public HttpResponseMessage PutEdit(int activityId, [FromBody] string mode)
        {
            try
            {
                var editActivity = _queryProcessor.Execute(new ActivityById(activityId));
                if (editActivity == null)
                {
                    var message = string.Format("Activity Id {0} not found.", activityId);
                    throw new Exception(message);
                }

                if (!editActivity.EditSourceId.HasValue)
                {
                    var message = string.Format("Activity Id {0} is not being edited.", activityId);
                    throw new Exception(message);
                }

                var updateActivityCommand = new UpdateActivity(User, editActivity.EditSourceId.Value, DateTime.Now, mode)
                {
                    Values = editActivity.Values.SingleOrDefault(x => x.ModeText == editActivity.ModeText)
                };
                _updateActivity.Handle(updateActivityCommand);

                var deleteActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
                _deleteActivity.Handle(deleteActivityCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "Activity update error"
                };
                throw new HttpResponseException(responseMessage);    
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an activity
        */
        // --------------------------------------------------------------------------------
        [DELETE("{activityId}")]
        public HttpResponseMessage Delete(int activityId)
        {
            try
            {
                var deleteActivityCommand = new DeleteActivity(User, activityId);
                _deleteActivity.Handle(deleteActivityCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "Activity delete error"
                };
                throw new HttpResponseException(responseMessage);               
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity documents
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}/documents")]
        public ICollection<ActivityDocumentApiModel> GetDocuments(int activityId, string activityMode)
        {
            ActivityDocument[] documents = _queryProcessor.Execute(new ActivityDocumentsByActivityIdAndMode(activityId, activityMode));
            if ((documents == null) || (documents.Length == 0))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            
            var model = Mapper.Map<ICollection<ActivityDocumentApiModel>>(documents);
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
                        return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                    }

                    Activity activity = _queryProcessor.Execute(new ActivityById(activityId));
                    if (activity == null)
                    {
                        string message = string.Format("Activity Id {0} not found", activityId);
                        return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, message);
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
                            throw new HttpResponseException(HttpStatusCode.InternalServerError);
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
                                    Mode = activity.Mode,
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
                                    Mode = activity.Mode,
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
         * Rename activity document
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}/documents/{documentId}/title")]
        public HttpResponseMessage PutDocumentsTitle(int activityId, int documentId, [FromBody] string newTitle)
        {
            ActivityDocument activityDocument = this._queryProcessor.Execute(new ActivityDocumentById(documentId));

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
                string.Format("Activity document id '{0}' was successfully renamed.", documentId.ToString()));
        }

        // --------------------------------------------------------------------------------
        /*
         * Validate activity document type
        */
        // --------------------------------------------------------------------------------
        [POST("{activityid}/documents/validate-upload-filetype")]
        public HttpResponseMessage PostDocumentsValidateUploadFiletype(int activityid, [FromBody] string extension)
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
