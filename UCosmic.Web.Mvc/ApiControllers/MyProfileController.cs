using System;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/my/profile")]
    public class MyProfileController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateMyProfile> _profileUpdateHandler;
        private readonly IHandleCommands<UpdateMyPhoto> _photoUpdateHandler;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;

        public MyProfileController(IProcessQueries queryProcessor
            , IHandleCommands<UpdateMyProfile> profileUpdateHandler
            , IHandleCommands<UpdateMyPhoto> photoUpdateHandler
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _photoUpdateHandler = photoUpdateHandler;
            _photoDeleteHandler = photoDeleteHandler;
        }

        [GET("")]
        public MyProfileApiModel Get()
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            var person = _queryProcessor.Execute(new MyPerson(User)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Employee,
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            var model = Mapper.Map<MyProfileApiModel>(person);

            return model;
        }

        [PUT("")]
        public HttpResponseMessage Put(MyProfileApiModel model)
        {
            var command = new UpdateMyProfile(User);
            Mapper.Map(model, command);

            try
            {
                _profileUpdateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Personal information was successfully updated.");
        }

        [POST("photo")]
        public HttpResponseMessage PostPhoto(FileMedia photo)
        {
            // when the photo us null, it's because the user tried to upload an invalid file type.
            if (photo == null)
            {
                const string failMessage = "Photo was not successfully uploaded.";
                return Request.CreateResponse(HttpStatusCode.BadRequest, failMessage);
            }

            _photoUpdateHandler.Handle(new UpdateMyPhoto(User)
            {
                Name = photo.FileName,
                MimeType = photo.ContentType,
                Content = photo.Content,
            });

            // for some reason, KendoUIWeb's upload widget will only think the upload succeeded
            // when the response is either empty, or contains a JSON payload with text/plain encoding.
            // so if we want to send a message back to the client, we have to serialize it in a JSON wrapper.
            const string successMessage = "Photo was successfully uploaded.";
            var successPayload = new { message = successMessage };
            var successJson = JsonConvert.SerializeObject(successPayload);
            return Request.CreateResponse(HttpStatusCode.OK, successJson, "text/plain");
        }

        [DELETE("photo")]
        public HttpResponseMessage DeletePhoto(KendoUploadRemoveFileApiModel model)
        {
            _photoDeleteHandler.Handle(new DeleteMyPhoto(User)
            {
                FileNames = (model != null) ? model.FileNames : null,
            });

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
