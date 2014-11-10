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
    [RoutePrefix("api/home/alert")]
    public class HomeAlertController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateHomeAlert> _alertUpdateHandler;
        private readonly IValidator<UpdateHomeAlert> _alertUpdateValidator;
        private readonly IHandleCommands<DeleteHomeAlert> _alertDeleteHandler;
        private readonly IHandleCommands<CreateHomeAlert> _alertCreateHandler;

        public HomeAlertController(IProcessQueries queryProcessor
            , IValidator<UpdateHomeAlert> alertUpdateValidator
            , IHandleCommands<UpdateHomeAlert> alertUpdateHandler
            , IHandleCommands<DeleteHomeAlert> alertDeleteHandler
            , IHandleCommands<CreateHomeAlert> alertCreateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _alertUpdateValidator = alertUpdateValidator;
            _alertUpdateHandler = alertUpdateHandler;
            _alertDeleteHandler = alertDeleteHandler;
            _alertCreateHandler = alertCreateHandler;
        }

        [GET("")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage Get(int establishmentId)
        {
            return Request.CreateResponse(HttpStatusCode.OK, "Your alert was retrieved successfully.");
        }

        [POST("")]
        public HttpResponseMessage Post(HomeAlertApiModel homeAlert)
        {

            var person = _queryProcessor.Execute(new MyPerson(User));
            var establishmentId = person.Affiliations.First(x => x.IsDefault).EstablishmentId;
            var homeAlertNow = _queryProcessor.Execute(new HomeAlertByEstablishmentId(establishmentId));
            homeAlert.EstablishmentId = establishmentId;

            if (homeAlertNow != null)
            {
                _alertDeleteHandler.Handle(new DeleteHomeAlert(User, homeAlertNow.Id));
            }

            var command = new CreateHomeAlert(User)
            {
                Text = homeAlert.Text,
                IsDisabled = homeAlert.IsDisabled,
                EstablishmentId = homeAlert.EstablishmentId
            };

            _alertCreateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Home alert was successfully created.");
            response.Headers.Location = new Uri("http://ucosmic.com?alertid="+command.CreatedHomeAlertId);
            return response;
            
        }


        [DELETE("")]
        public HttpResponseMessage Delete(int homeAlertId)
        {
            //make it like delete agreement and create purgeHomeAlert class...
            _alertDeleteHandler.Handle(new DeleteHomeAlert(User, homeAlertId));

            return Request.CreateResponse(HttpStatusCode.OK, "Your alert was deleted successfully.");
        }
    }
}
