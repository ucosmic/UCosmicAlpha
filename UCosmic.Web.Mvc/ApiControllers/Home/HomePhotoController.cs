using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using ImageResizer;
using FluentValidation;
using FluentValidation.Results;
using Newtonsoft.Json;
using UCosmic.Domain.People;
using UCosmic.Domain.Home;
using UCosmic.Web.Mvc.Models;
using System.Linq.Expressions;
using System.Net.Http.Headers;

namespace UCosmic.Web.Mvc.ApiControllers
{
    
    [RoutePrefix("api/home/photo")]
    public class HomePhotoController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateHomePhoto> _photoUpdateHandler;
        private readonly IValidator<UpdateHomePhoto> _photoUpdateValidator;
        private readonly IHandleCommands<DeleteHomePhoto> _photoDeleteHandler;
        private readonly IStoreBinaryData _binaryData;

        public HomePhotoController(IProcessQueries queryProcessor
            , IValidator<UpdateHomePhoto> photoUpdateValidator
            , IHandleCommands<UpdateHomePhoto> photoUpdateHandler
            , IHandleCommands<DeleteHomePhoto> photoDeleteHandler
            , IStoreBinaryData binaryData
        )
        {
            _queryProcessor = queryProcessor;
            _photoUpdateValidator = photoUpdateValidator;
            _photoUpdateHandler = photoUpdateHandler;
            _photoDeleteHandler = photoDeleteHandler;
            _binaryData = binaryData;
        }
        
        [GET("{homeSectionId:int}/photo")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage GetPhoto(int homeSectionId, [FromUri] ImageResizeRequestModel model)
        {
            var homeSection = _queryProcessor.Execute(new HomeSectionById(homeSectionId)
            {
                EagerLoad = new Expression<Func<HomeSection, object>>[]
                {
                    x => x.Photo,
                }
            });

            var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
            var mimeType = "image/png";
            var settings = Mapper.Map<ResizeSettings>(model);

            var content = homeSection != null && homeSection.Photo != null ? _binaryData.Get(homeSection.Photo.Path) : null;
            if (content != null)
            {
                // resize the user's photo image
                mimeType = homeSection.Photo.MimeType;
                ImageBuilder.Current.Build(new MemoryStream(content), stream, settings, true);
            }
            else
            {
                // otherwise, return the unisex photo
                var relativePath = string.Format("~/{0}", Links.images.icons.user.unisex_a_128_png);
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

        [POST("")]
        public HttpResponseMessage Post(FileMedium photo, int homeSectionId)
        {

            // when the photo us null, it's because the user tried to upload an invalid file type (415)
            if (photo == null)
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            // do not allow photo uploads exceeding 1MB (413)

            var command = new UpdateHomePhoto(homeSectionId)
            {
                Name = photo.FileName,
                MimeType = photo.ContentType,
                Content = photo.Content,
            };
            try
            {
                _photoUpdateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                Func<ValidationFailure, bool> forName = x => x.PropertyName == command.PropertyName(y => y.Name);
                Func<ValidationFailure, bool> forContent = x => x.PropertyName == command.PropertyName(y => y.Content);
                if (ex.Errors.Any(forName))
                    return Request.CreateResponse(HttpStatusCode.UnsupportedMediaType,
                        ex.Errors.First(forName).ErrorMessage, "text/plain");
                if (ex.Errors.Any(forContent))
                    return Request.CreateResponse(HttpStatusCode.RequestEntityTooLarge,
                        ex.Errors.First(forContent).ErrorMessage, "text/plain");
            }

            // for some reason, KendoUIWeb's upload widget will only think the upload succeeded
            // when the response is either empty, or contains a JSON payload with text/plain encoding.
            // so if we want to send a message back to the client, we have to serialize it in a JSON wrapper.
            const string successMessage = "Your photo was changed successfully.";
            var successPayload = new { message = successMessage };
            var successJson = JsonConvert.SerializeObject(successPayload);
            return Request.CreateResponse(HttpStatusCode.OK, successJson, "text/plain");
        }

        [POST("validate")]
        public HttpResponseMessage ValidatePost(FileUploadValidationModel model, int homeSectionId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new UpdateHomePhoto(homeSectionId)
            {
                Name = model.Name,
                Content = model.Length.HasValue ? new byte[model.Length.Value] : new byte[0],
            };
            var validationResult = _photoUpdateValidator.Validate(command);
            var forProperties = new List<Func<ValidationFailure, bool>>
            {
                x => x.PropertyName == command.PropertyName(y => y.Name),
            };
            if (model.Length.HasValue)
                forProperties.Add(x => x.PropertyName == command.PropertyName(y => y.Content));
            foreach (var forProperty in forProperties)
                if (validationResult.Errors.Any(forProperty))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        validationResult.Errors.First(forProperty).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("")]
        public HttpResponseMessage Delete(int homeSectionId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //throw new Exception("Oops"); // test unexpected server error

            /*
             * Do not use this endpoint for KendoUIWeb's Upload widget. See the
             * KendoRemovePhoto action comment below. This action is for deleting
             * a photo when a new one is not being simultaneously uploaded.
             */

            _photoDeleteHandler.Handle(new DeleteHomePhoto(homeSectionId));

            return Request.CreateResponse(HttpStatusCode.OK, "Your photo was deleted successfully.");
        }
    }
}
