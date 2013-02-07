using AutoMapper;
using System.Linq;
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
        public EmployeeFacultyRank EmployeeFacultyRank { get; set; }
    public string EmployeeAdministrativeAppointments { get; set; }
    public string EmployeeJobTitles { get; set; }

        public static class PersonApiProfiler
        {            // employee personal profile page
            bundles.Add(new ScriptBundle("~/bundles/employees/people").Include(
                "~/scripts/require/require.js",
                "~/scripts/datacontext/iemployee.js",
                "~/scripts/datacontext/employeewebservice.js",
                "~/scripts/viewmodels/employees/PersonalInfo.js"));
            public class WorkingTitleResolver : ValueResolver<Person, string>
            {
                protected override string ResolveCore(Person person)
                {
                    string workingTitle = null;
                    Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
                    if (primaryAffiliation != null)
                    {
                        workingTitle = primaryAffiliation.JobTitles;
                    }
                    return workingTitle;
                }
            }
            public class PersonToPersonApiModelProfile : Profile
            {
                protected override void Configure()
                {
                    CreateMap<Person, PersonApiModel>()
                        .ForMember(dst => dst.WorkingTitle, opt => opt.ResolveUsing<WorkingTitleResolver>());

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