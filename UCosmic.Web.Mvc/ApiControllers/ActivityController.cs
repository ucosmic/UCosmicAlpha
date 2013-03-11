using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/activity")]
    public class ActivityController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateActivity> _profileUpdateHandler;

        public ActivityController(IProcessQueries queryProcessor
                                  , IHandleCommands<UpdateActivity> profileUpdateHandler )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
        }

        [GET("{id}")]
        public ActivityApiModel Get(int id)
        {
            Activity activity = this._queryProcessor.Execute(new ActivityByEntityId {Id = id});

            ActivityApiModel model = Mapper.Map<ActivityApiModel>(activity);

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


    }
}
