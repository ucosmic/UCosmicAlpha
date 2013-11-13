using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonActivitiesViewModel
    {
        public int PersonId { get; set; }
        //public int? UserId { get; set; }
        public string DisplayName { get; set; }
        //public string Salutation { get; set; }
        //public string FirstName { get; set; }
        //public string MiddleName { get; set; }
        //public string LastName { get; set; }
        //public string Suffix { get; set; }
        public string EmailAddress { get; set; }
        public string JobTitle { get; set; }
        //public ActivityPublicViewModel[] Activities { get; set; }
    }
    public static class PersonActivitiesViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, PersonActivitiesViewModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.EmailAddress, o => o.MapFrom(s => s.Emails.Any(x => x.IsDefault) ? s.Emails.FirstOrDefault(x => x.IsDefault).Value : null))
                    .ForMember(d => d.JobTitle, o => o.MapFrom(s => s.DefaultAffiliation.IsDefault ? s.DefaultAffiliation.JobTitles : null))
                    //.ForMember(d => d.Activities, o => o.MapFrom(s => s.DefaultAffiliation))
                ;
            }
        }
    }
}