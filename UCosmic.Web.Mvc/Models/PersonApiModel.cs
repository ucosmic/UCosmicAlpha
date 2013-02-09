using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;


namespace UCosmic.Web.Mvc.Models
{
    public class PersonApiModel
    {
        /* From Person */
        public int RevisionId { get; set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        /* From Employee */
        public int? EmployeeId { get; set; }
        public EmployeeFacultyRank EmployeeFacultyRank { get; set; } // never have entity properties in a viewmodel, use scalar fk's
        public int? EmployeeFacultyRankId { get; set; }
        public string EmployeeAdministrativeAppointments { get; set; }
        public string EmployeeJobTitles { get; set; }

        public static class PersonApiProfiler
        {
            public class PersonToPersonApiModelProfile : Profile
            {
                protected override void Configure()
                {
                    CreateMap<Person, PersonApiModel>();

                    CreateMap<PersonApiModel, UpdatePerson>();
                }
            }

            public class ModelToGenerateDisplayNameProfile : Profile
            {
                protected override void Configure()
                {
                    CreateMap<PersonApiModel, GenerateDisplayName>();
                }
            }
        }
    }
}