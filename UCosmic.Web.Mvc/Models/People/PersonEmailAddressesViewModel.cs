using System.Linq;
using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonEmailAddressesViewModel
    {
        public string Username { get; set; }
        public PersonEmailAddressViewModel[] Emails { get; set; }
    }

    public static class PersonEmailAddressesProfiler
    {
        public class PersonToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, PersonEmailAddressesViewModel>()
                    .ForMember(d => d.Username, o => o.MapFrom(s => s.User != null ? s.User.Name : null))
                    .ForMember(d => d.Emails, o => o.MapFrom(s => s.Emails.OrderByDescending(x => x.IsDefault)
                        .ThenByDescending(x => x.IsConfirmed).ThenBy(x => x.Value)))
                ;
            }
        }
    }
}