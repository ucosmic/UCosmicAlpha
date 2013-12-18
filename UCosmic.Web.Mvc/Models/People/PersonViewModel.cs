using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonViewModel
    {
        public int PersonId { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public string JobTitles { get; set; }
        public string[] EmailAddresses { get; set; }
    }
    public static class PeopleViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, PersonViewModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.EmailAddress, o => o.MapFrom(s => s.Emails.Any(x => x.IsDefault) ? s.Emails.FirstOrDefault(x => x.IsDefault).Value : null))
                    .ForMember(d => d.JobTitles, o => o.MapFrom(s => s.DefaultAffiliation.IsDefault ? s.DefaultAffiliation.JobTitles : null))
                    .ForMember(d => d.EmailAddresses, o => o.MapFrom(s => s.Emails.Where(x => !x.IsDefault).ToArray()))
                ;
            }
        }
    }
}