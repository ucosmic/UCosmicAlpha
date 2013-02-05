using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class PeopleController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdatePerson> _updateHandler;

        // reformatted: makes it easier to add additional constructor args if needed
        // (for example additional command handlers or command validators)
        public PeopleController(IProcessQueries queryProcessor
            , IHandleCommands<UpdatePerson> updateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
        }
        
        [GET("{id}")]
        public PersonApiModel Get(int id)
        {
            Person person = _queryProcessor.Execute(new PersonById(id));

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            PersonApiModel model = Mapper.Map<PersonApiModel>(person);
            return model;
        }

        [GET("{id}/salutations")]
        public IEnumerable<string> GetSalutations(int id) // made return type IEnumerable<T> for consistency
        {
            return PersonSalutation.Values;
        }

        [GET("{id}/suffixes")]
        public IEnumerable<string> GetSuffixes(int id) // made return type IEnumerable<T> for consistency
        {
            return PersonSuffixes.Values;
        }

        /* TODO: This needs to be moved to EmployeeModuleSettingsApiController */
        [GET("{id}/facultyranks")]
        public IEnumerable<EmployeeFacultyRank> GetFacultyRanks(int id) // made return type IEnumerable<T> for consistency
        {
            Person person = _queryProcessor.Execute(new PersonById(id));
            /* TODO: RootEmployeeModuleSettingsById */
            EmployeeModuleSettings employeeModuleSettings = _queryProcessor.Execute(new RootEmployeeModuleSettingsByUserName(person.User.Name));
            return employeeModuleSettings.FacultyRanks;
        }

        [PUT("{id}")]
        public HttpResponseMessage Put(int id, PersonApiModel model)
        {
            var command = new UpdatePerson(id);
            Mapper.Map(model, command);

            try
            {
                _updateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }
            
            return Request.CreateResponse(HttpStatusCode.OK, "Personal information was successfully updated.");
        }
    }
}
