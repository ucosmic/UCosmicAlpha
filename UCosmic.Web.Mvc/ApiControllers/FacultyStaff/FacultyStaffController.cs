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
using FluentValidation.Results;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class FacultyStaffController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public FacultyStaffController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [POST("")]
        public FacultyStaffResultsModel Post(FacultyStaffFilterModel filter)
        {
            var model = new FacultyStaffResultsModel();



            return model;
        }
    }
}
