using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [TryAuthorize]
    [RoutePrefix("api/my/affiliations")]
    public class MyAffiliationsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateMyAffiliation> _createAffiliationHandler;
        private readonly IHandleCommands<UpdateMyAffiliation> _updateAffiliationHandler;
        private readonly IHandleCommands<DeleteMyAffiliation> _deleteAffiliationHandler;

        public MyAffiliationsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateMyAffiliation> createAffiliationHandler
            , IHandleCommands<UpdateMyAffiliation> updateAffiliationHandler
            , IHandleCommands<DeleteMyAffiliation> deleteAffiliationHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createAffiliationHandler = createAffiliationHandler;
            _updateAffiliationHandler = updateAffiliationHandler;
            _deleteAffiliationHandler = deleteAffiliationHandler;
        }

        [GET("")]
        public IEnumerable<MyAffiliationApiModel> Get()
        {
            var person = _queryProcessor.Execute(new MyPerson(User)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<MyAffiliationApiModel[]>(person.Affiliations);

            return model;
        }

        [POST("")]
        public HttpResponseMessage Post(MyAffiliationApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var createAffiliationCommand = new CreateMyAffiliation(User)
            {
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
            catch (ValidationException ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ex.Errors.First().ErrorMessage, "text/plain");
            }
            //catch
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent("An error occurred creating affiliation. It is possible this affiliation already exists."),
            //        ReasonPhrase = "Affiliation Create Error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            var id = createAffiliationCommand.CreatedAffiliationId;

            return Request.CreateResponse(HttpStatusCode.Created, id);
        }

        [PUT("{affiliationId:int}")]
        public HttpResponseMessage Put(int affiliationId, MyAffiliationApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            model.Id = affiliationId;
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

            //try
            //{
            _updateAffiliationHandler.Handle(updateAffiliationCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Affiliation Update Error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("{affiliationId:int}")]
        public HttpResponseMessage Delete(int affiliationId)
        {
            var deleteAffiiationCommand = new DeleteMyAffiliation(User, affiliationId);
            _deleteAffiliationHandler.Handle(deleteAffiiationCommand);

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
