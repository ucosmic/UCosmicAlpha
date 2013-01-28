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

        public PeopleController(IProcessQueries queryProcessor
                                , IHandleCommands<UpdatePerson> updateHandler )
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
        }
        
        [GET("{id}")]
        public PersonApiModel Get(int id)
        {
            Person person = _queryProcessor.Execute(new PersonById(id));
            PersonApiModel model = Mapper.Map<Person, PersonApiModel>(person);

            return model;
        }

        [GET("{id}/salutations")]
        public string[] GetSalutations(int id)
        {
            return PersonSalutation.Values;
        }
        
        /* TODO: This needs to be moved to EmployeeModuleSettingsApiController */
        [GET("{id}/facultyranks")]
        public ICollection<EmployeeFacultyRank> GetFacultyRanks(int id)
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
