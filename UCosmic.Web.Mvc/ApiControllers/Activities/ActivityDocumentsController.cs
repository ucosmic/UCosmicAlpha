using System;
using System.Collections.Generic;
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
        private const string PluralUrl =        "{activityId:int}/documents";
        private const string SingleUrl =        "{activityId:int}/documents/{documentId:int}";
        private const string ThumbnailUrl =     "{activityId:int}/documents/{documentId:int}/thumbnail";
        private const string ValidateUrl =      "documents/validate-upload";

        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;
        private readonly IValidator<CreateActivityDocument> _createValidator;
        private readonly IHandleCommands<CreateActivityDocument> _createHandler;
        private readonly IHandleCommands<UpdateActivityDocument> _updateHandler;
        private readonly IHandleCommands<PurgeActivityDocument> _purgeHandler;

        public ActivityDocumentsController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
            , IValidator<CreateActivityDocument> createValidator
            , IHandleCommands<CreateActivityDocument> createHandler
            , IHandleCommands<UpdateActivityDocument> updateHandler
            , IHandleCommands<PurgeActivityDocument> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _createValidator = createValidator;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _purgeHandler = purgeHandler;
        }

        [GET(PluralUrl)]
        public IEnumerable<ActivityDocumentApiModel> Get(int activityId, ActivityMode? mode = null)
        {
            var entities = _queryProcessor.Execute(new ActivityDocumentsByActivityId(activityId)
            {
                Mode = mode,
            });
            var models = Mapper.Map<ActivityDocumentApiModel[]>(entities);
            return models;
        }

        [CacheHttpGet(Duration = 3600)]
        [GET(ThumbnailUrl)]
        public HttpResponseMessage GetThumbnail(int activityId, int documentId, [FromUri] ImageResizeRequestModel model)
        {
            var document = _queryProcessor.Execute(new ActivityDocumentById(activityId, documentId)
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

        [Authorize]
        [POST(PluralUrl)]
        public HttpResponseMessage Post(int activityId, ActivityMode activityMode, FileMedium fileMedium)
        {
            var command = new CreateActivityDocument(User, activityId, activityMode)
            {
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

        [Authorize]
        [POST(ValidateUrl)]
        public HttpResponseMessage PostValidate([FromBody] FileUploadValidationModel model)
        {
            var command = new CreateActivityDocument(User, 0)
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

        [Authorize]
        [PUT(SingleUrl)]
        public HttpResponseMessage Put(int activityId, int documentId, ActivityDocumentApiPutModel model)
        {
            var command = new UpdateActivityDocument(User, activityId, documentId)
            {
                Title = model.Title,
            };

            try
            {
                _updateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Activity document was successfully renamed.");
        }

        [Authorize]
        [DELETE(SingleUrl)]
        public HttpResponseMessage Delete(int activityId, int documentId)
        {
            var command = new PurgeActivityDocument(User, activityId, documentId);

            try
            {
                _purgeHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Activity document was successfully deleted.");
        }
    }
}
