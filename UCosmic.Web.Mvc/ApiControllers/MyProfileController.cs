using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using Newtonsoft.Json;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [System.Web.Http.Authorize]
    [RoutePrefix("api/my/profile")]
    public class MyProfileController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateMyProfile> _profileUpdateHandler;
        private readonly IHandleCommands<UpdateMyPhoto> _photoUpdateHandler;
        private readonly IValidator<UpdateMyPhoto> _photoUpdateValidator;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;
        private readonly IHandleCommands<CreateMyAffiliation> _createAffiliationHandler;
        private readonly IHandleCommands<UpdateMyAffiliation> _updateAffiliationHandler;
        private readonly IHandleCommands<DeleteMyAffiliation> _deleteAffiliationHandler;

        public MyProfileController(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<UpdateMyProfile> profileUpdateHandler
            , IValidator<UpdateMyPhoto> photoUpdateValidator
            , IHandleCommands<UpdateMyPhoto> photoUpdateHandler
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
            , IHandleCommands<CreateMyAffiliation> createAffiliationHandler
            , IHandleCommands<UpdateMyAffiliation> updateAffiliationHandler
            , IHandleCommands<DeleteMyAffiliation> deleteAffiliationHandler
        )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _photoUpdateValidator = photoUpdateValidator;
            _photoUpdateHandler = photoUpdateHandler;
            _photoDeleteHandler = photoDeleteHandler;
            _entities = entities;
            _createAffiliationHandler = createAffiliationHandler;
            _updateAffiliationHandler = updateAffiliationHandler;
            _deleteAffiliationHandler = deleteAffiliationHandler;
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
                    x => x.Photo,
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            var model = Mapper.Map<MyProfileApiModel>(person);

            /* Does the default establishment have campuses? */
            var defaultEstablishmentId = person.DefaultAffiliation.EstablishmentId;
            var campusEstablishmentType = _entities.Get<EstablishmentType>().Single(t => t.EnglishName == "University Campus");
            model.DefaultEstablishmentHasCampuses = _entities.Get<Establishment>()
                                                             .Count(
                                                                 e =>
                                                                 (e.Parent.RevisionId == defaultEstablishmentId) &&
                                                                 (e.Type.RevisionId == campusEstablishmentType.RevisionId)) > 0;

            return model;
        }

        [PUT("")]
        public HttpResponseMessage Put(MyProfileApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

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

            return Request.CreateResponse(HttpStatusCode.OK, "Your profile was saved successfully.");
        }

        [GET("photo")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage GetPhoto([FromUri] ImageResizeRequestModel model)
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

        [POST("photo")]
        public HttpResponseMessage PostPhoto(FileMedium photo)
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

        [POST("photo/validate")]
        public HttpResponseMessage ValidatePhoto(PersonPhotoApiModel photo)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new UpdateMyPhoto(User)
            {
                Name = photo.Name,
            };
            command.Content = photo.Length.HasValue ? new byte[photo.Length.Value] : new byte[0];
            var validationResult = _photoUpdateValidator.Validate(command);
            var forProperties = new List<Func<ValidationFailure, bool>>
            {
                x => x.PropertyName == command.PropertyName(y => y.Name),
            };
            if (photo.Length.HasValue)
                forProperties.Add(x => x.PropertyName == command.PropertyName(y => y.Content));
            foreach (var forProperty in forProperties)
                if (validationResult.Errors.Any(forProperty))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        validationResult.Errors.First(forProperty).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("photo")]
        public HttpResponseMessage DeletePhoto()
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

        /*
         * Get affiliations
        */
        // --------------------------------------------------------------------------------
        [GET("affiliation")]
        public IEnumerable<MyProfileAffiliationApiModel> GetAffiliation()
        {
            var person = _queryProcessor.Execute(new MyPerson(User)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Employee
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<MyProfileAffiliationApiModel[]>(person.Affiliations);

            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Create an affiliation
        */
        // --------------------------------------------------------------------------------
        [POST("affiliation")]
        public HttpResponseMessage PostAffiliation(MyProfileAffiliationApiModel model)
        {
            if (model == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var createAffiliationCommand = new CreateMyAffiliation
            {
                PersonId = model.PersonId,
                EstablishmentId = model.EstablishmentId,
                CampusId = model.CampusId,
                CollegeId = model.CollegeId,
                DepartmentId = model.DepartmentId,
                FacultyRankId = model.FacultyRankId
            };

            try
            {
                _createAffiliationHandler.Handle(createAffiliationCommand);
            }
            catch
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent("An error occurred creating affiliation. It is possible this affiliation already exists."),
                    ReasonPhrase = "Affiliation Create Error"
                };
                throw new HttpResponseException(responseMessage);                
            }

            var id = createAffiliationCommand.CreatedAffiliation.RevisionId;

            return Request.CreateResponse(HttpStatusCode.Created, id);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an affiliation
        */
        // --------------------------------------------------------------------------------
        [PUT("affiliation")]
        public HttpResponseMessage PutAffiliation(MyProfileAffiliationApiModel model)
        {
            if (model == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var updateAffiliationCommand = new UpdateMyAffiliation(User,
                                                                   model.Id,
                                                                   model.PersonId,
                                                                   model.EstablishmentId)
            {
                CampusId = model.CampusId,
                CollegeId = model.CollegeId,
                DepartmentId = model.DepartmentId,
                FacultyRankId = model.FacultyRankId
            };

            try {
                _updateAffiliationHandler.Handle(updateAffiliationCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "Affiliation Update Error"
                };
                throw new HttpResponseException(responseMessage);                
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("affiliation")]
        public HttpResponseMessage DeleteAffiliation(MyProfileAffiliationApiModel model)
        {
            if (model == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            } 
            
            try
            {
                var deleteAffiiationCommand = new DeleteMyAffiliation(User, model.Id);
                _deleteAffiliationHandler.Handle(deleteAffiiationCommand);
            }
            catch (Exception ex)
            {
                var responseMessage = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotModified,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = "Affiliation Delete Error"
                };
                throw new HttpResponseException(responseMessage);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
