using System.ComponentModel.DataAnnotations;
using System.Linq;
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
    public class PersonController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdatePerson> _updateHandler;

        public PersonController(IProcessQueries queryProcessor
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

        /* TODO: When I didn't provide the {id}, router did not find this. Why? */
        [GET("{id}/salutations")]
        public string[] GetSalutations(int id)
        {
            return PersonSalutation.Values;
        }
        
        /* TODO: This needs to be moved to EmployeeModuleSettingsApiController */
        [GET("{id}/facultyranks")]
        public EmployeeFacultyRank[] GetFacultyRanks(int id)
        {
            Person person = _queryProcessor.Execute(new PersonById(id));
            /* TODO: RootEmployeeModuleSettingsById */
            EmployeeModuleSettings employeeModuleSettings = _queryProcessor.Execute(new RootEmployeeModuleSettingsByUserName(person.User.Name));
            EmployeeFacultyRank[] facultyRanks = new EmployeeFacultyRank[employeeModuleSettings.FacultyRanks.Count];
            for(int i = 0; i < employeeModuleSettings.FacultyRanks.Count; i +=1 )
            {
                facultyRanks[i] = employeeModuleSettings.FacultyRanks.ElementAt(i);
            }
            return facultyRanks;
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
