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
using UCosmic.Domain.Home;
using UCosmic.Web.Mvc.Models;
using AutoMapper;
using System.Diagnostics;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [System.Web.Http.Authorize]
    [RoutePrefix("api/home/section")]
    public class HomeSectionController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateHomeSection> _sectionUpdateHandler;
        private readonly IValidator<UpdateHomeSection> _sectionUpdateValidator;
        private readonly IHandleCommands<DeleteHomeSection> _sectionDeleteHandler;
        private readonly IHandleCommands<CreateHomeSection> _sectionCreateHandler;

        public HomeSectionController(IProcessQueries queryProcessor
            , IValidator<UpdateHomeSection> sectionUpdateValidator
            , IHandleCommands<UpdateHomeSection> sectionUpdateHandler
            , IHandleCommands<DeleteHomeSection> sectionDeleteHandler
            , IHandleCommands<CreateHomeSection> sectionCreateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _sectionUpdateValidator = sectionUpdateValidator;
            _sectionUpdateHandler = sectionUpdateHandler;
            _sectionDeleteHandler = sectionDeleteHandler;
            _sectionCreateHandler = sectionCreateHandler;
        }

        [GET("")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage Get(int establishmentId)
        {
            return Request.CreateResponse(HttpStatusCode.OK, "Your section was retrieved successfully.");
        }

        [POST("")]
        public HttpResponseMessage Post(HomeSectionApiModel homeSection)
        {

            var person = _queryProcessor.Execute(new MyPerson(User));
            var establishmentId = person.Affiliations.First(x => x.IsDefault).EstablishmentId;
            homeSection.EstablishmentId = establishmentId;

            var command = new CreateHomeSection(User)
            {
                Description = homeSection.Description,
                Title = homeSection.Title,
                Links = homeSection.Links,
                EstablishmentId = homeSection.EstablishmentId
            };

            _sectionCreateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Home section was successfully created.");
            response.Headers.Location = new Uri("http://ucosmic.com?sectionid="+command.CreatedHomeSectionId);
            return response;
            
        }


        [DELETE("")]
        public HttpResponseMessage Delete(int homeSectionId)
        {
            //make it like delete agreement and create purgeHomeSection class...
            _sectionDeleteHandler.Handle(new DeleteHomeSection(User, homeSectionId));

            return Request.CreateResponse(HttpStatusCode.OK, "Your section was deleted successfully.");
        }
    }
}
