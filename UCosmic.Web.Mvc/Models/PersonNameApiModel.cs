using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonNameApiModel
    {
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }

        public static class PersonNameApiModelProfiler
        {
            public class EntityToModelProfile : Profile
            {
                protected override void Configure()
                {
                    CreateMap<Person, PersonNameApiModel>();
                }
            }

            public class ModelToGenerateDisplayNameProfile : Profile
            {
                protected override void Configure()
                {
                    CreateMap<PersonNameApiModel, GenerateDisplayName>();
                }
            }
        }
    }
}