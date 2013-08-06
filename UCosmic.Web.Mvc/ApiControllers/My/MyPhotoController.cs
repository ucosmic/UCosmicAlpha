using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Http;
using FluentValidation;
using FluentValidation.Results;
using Newtonsoft.Json;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [TryAuthorize]
    [RoutePrefix("api/my/photo")]
    public class MyPhotoController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateMyPhoto> _photoUpdateHandler;
        private readonly IValidator<UpdateMyPhoto> _photoUpdateValidator;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;

        public MyPhotoController(IProcessQueries queryProcessor
            , IValidator<UpdateMyPhoto> photoUpdateValidator
            , IHandleCommands<UpdateMyPhoto> photoUpdateHandler
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _photoUpdateValidator = photoUpdateValidator;
            _photoUpdateHandler = photoUpdateHandler;
            _photoDeleteHandler = photoDeleteHandler;
        }

        [GET("")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage Get([FromUri] ImageResizeRequestModel model)
        {
            var tenancy = Request.Tenancy();
            int? personId;
            if (tenancy != null && tenancy.PersonId.HasValue)
            {
                personId = tenancy.PersonId.Value;
            }
            else
            {
                var person = _queryProcessor.Execute(new MyPerson(User));
                personId = person.RevisionId;
            }

            var peopleController = DependencyResolver.Current.GetService<PeopleController>();
            peopleController.Request = Request;

            var response = peopleController.GetPhoto(personId.Value, model);
            return response;
        }

        [POST("")]
        public HttpResponseMessage Post(FileMedium photo)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //throw new Exception("Oops"); // test unexpected server error

            // when the photo us null, it's because the user tried to upload an invalid file type (415)
            if (photo == null)
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            // do not allow photo uploads exceeding 1MB (413)
            //if (photo.Content.Length > (1024 * 1024))
            //    throw new HttpResponseException(HttpStatusCode.RequestEntityTooLarge);

            var command = new UpdateMyPhoto(User)
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
        public HttpResponseMessage ValidatePost(FileUploadValidationModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new UpdateMyPhoto(User)
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
        public HttpResponseMessage Delete()
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //throw new Exception("Oops"); // test unexpected server error

            /*
             * Do not use this endpoint for KendoUIWeb's Upload widget. See the
             * KendoRemovePhoto action comment below. This action is for deleting
             * a photo when a new one is not being simultaneously uploaded.
             */

            _photoDeleteHandler.Handle(new DeleteMyPhoto(User));

            return Request.CreateResponse(HttpStatusCode.OK, "Your photo was deleted successfully.");
        }
    }
}
