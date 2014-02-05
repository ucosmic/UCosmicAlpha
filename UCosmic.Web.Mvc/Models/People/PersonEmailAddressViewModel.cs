using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonEmailAddressViewModel
    {
        public string Value { get; set; }
        public bool IsDefault { get; set; }
        public bool IsConfirmed { get; set; }
        public int PersonId { get; set; }
        public int Number { get; set; }
    }

    public static class PersonEmailAddressProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmailAddress, PersonEmailAddressViewModel>();
            }
        }
    }
}