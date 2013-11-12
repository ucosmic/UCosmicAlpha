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
        public int Id { get; set; }
        public int? UserId { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string DefaultEmailAddress { get; set; }
    }
    //public static class PeopleViewProfiler
    //{
    //    public class EntityToModel : Profile
    //    {
    //        protected override void Configure()
    //        {
    //            CreateMap<Person, PersonViewModel>()
    //                //.ForMember(d => d.IsExternallyFunded, o => o.MapFrom(s => s.WasExternallyFunded))
    //                //.ForMember(d => d.IsInternallyFunded, o => o.MapFrom(s => s.WasInternallyFunded))
    //                //.ForMember(d => d.Places, o => o.MapFrom(s => s.Locations))
    //                //.ForMember(d => d.Content, o => o.MapFrom(s => new HtmlString(s.Content)))
    //                //.ForMember(d => d.Person, o => o.MapFrom(s => s.Activity.Person))
    //            ;
    //        }
    //    }
    //}
}