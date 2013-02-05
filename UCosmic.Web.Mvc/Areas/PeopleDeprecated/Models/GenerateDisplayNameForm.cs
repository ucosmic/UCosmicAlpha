using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Areas.PeopleDeprecated.Models
{
    public class GenerateDisplayNameForm
    {
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
    }

    public static class GenerateDisplayNameProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<GenerateDisplayNameForm, GenerateDisplayName>();
            }
        }
    }
}