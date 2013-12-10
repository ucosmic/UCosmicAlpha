using System;
using AutoMapper;
using System.Linq;
using UCosmic.Domain.Activities;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPersonViewModel
    {
        public int PersonId { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public string JobTitle { get; set; }
    }


    public static class ActivityPersonViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, ActivityPersonViewModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.EmailAddress, o => o.MapFrom(s => s.Emails.Any(x => x.IsDefault) ? s.Emails.FirstOrDefault(x => x.IsDefault).Value : null))
                    .ForMember(d => d.JobTitle, o => o.MapFrom(s => s.DefaultAffiliation.IsDefault ? s.DefaultAffiliation.JobTitles : null))
                    ;
            }
        }
    }
}