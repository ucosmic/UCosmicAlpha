#if false
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Files;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/activity")]
    public class ActivityController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateActivity> _profileUpdateHandler;
        private readonly IValidator<CreateImage> _validateImage;
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IValidator<CreateLoadableFile> _validateLoadableFile;
        private readonly IHandleCommands<CreateLoadableFile> _createLoadableFile;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteActivityDocument; 
        private readonly IUnitOfWork _unitOfWork;

        public ActivityController(IProcessQueries queryProcessor
                                  , IHandleCommands<UpdateActivity> profileUpdateHandler
                                  , IValidator<CreateImage> validateImage
                                  , IHandleCommands<CreateImage> createImage
                                  , IValidator<CreateLoadableFile> validateLoadableFile
                                  , IHandleCommands<CreateLoadableFile> createLoadableFile
                                  , IHandleCommands<CreateActivityDocument> createActivityDocument
                                  , IHandleCommands<DeleteActivityDocument> deleteActivityDocument
                                  , IUnitOfWork unitOfWork )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _validateImage = validateImage;
            _createImage = createImage;
            _validateLoadableFile = validateLoadableFile;
            _createLoadableFile = createLoadableFile; 
            _createActivityDocument = createActivityDocument;
            _deleteActivityDocument = deleteActivityDocument;
            _unitOfWork = unitOfWork;
        }

        [GET("{id}")]
        public ActivityApiModel Get(int id)
        {
            Activity activity = this._queryProcessor.Execute(new ActivityByEntityId {Id = id});

            var model = Mapper.Map<ActivityApiModel>(activity);

            return model;
        }

        [GET("{valuesId}/documents")]
        public ICollection<ActivityDocumentApiModel> GetDocuments(int valuesId)
        {
            ActivityDocument[] documents = this._queryProcessor.Execute(new ActivityDocumentsByValuesId(valuesId));

            var model = Mapper.Map<ICollection<ActivityDocumentApiModel>>(documents);

            return model;
        }

        [PUT("")]
        public HttpResponseMessage Put(ActivityApiModel model)
        {
            //var command = new UpdateActivity();
            //Mapper.Map(model, command);

            //try
            //{
            //    _profileUpdateHandler.Handle(command);
            //}
            //catch (ValidationException ex)
            //{
            //    var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            //    return badRequest;
            //}

            return Request.CreateResponse(HttpStatusCode.OK, "Your activity was saved successfully.");
        }

        [POST("upload/{activityId}")]
        public Task<HttpResponseMessage> PostUpload(int activityId)
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
                        char[] trimChars = {'"'};
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

                            _unitOfWork.SaveChanges();
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

        [DELETE("{activityDocumentId}/document")]
        public HttpResponseMessage DeleteDocument(int activityDocumentId)
        {
            ActivityDocument activityDocument = this._queryProcessor.Execute(new ActivityDocumentById(activityDocumentId));

            var command = new DeleteActivityDocument(User, activityDocumentId);

            try
            {
                _deleteActivityDocument.Handle(command);
            }
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            }

            return Request.CreateResponse(HttpStatusCode.OK,
                string.Format("Activity document id '{0}' was successfully deleted.", activityDocumentId.ToString()));
        }


    }
}
#endif
