using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonApiModel
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
        public bool IsActive { get; set; }
        public string Gender { get; set; }
        public string DefaultEmailAddress { get; set; }
        public bool HasPhoto { get; set; }
    }

    public class PageOfPersonApiModel : PageOf<PersonApiModel> { }

    public static class PersonApiModelProfiler
    {
        internal static readonly IEnumerable<Expression<Func<Person, object>>> EagerLoads =
            new Expression<Func<Person, object>>[]
            {
                x => x.Emails,
                x => x.User,
                x => x.Affiliations,
                x => x.Photo,
            };

        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, PersonApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.UserId, o => o.MapFrom(s => s.User == null ? (int?)null : s.User.RevisionId))
                    .ForMember(d => d.DefaultEmailAddress, o => o.MapFrom(s =>
                        (s.DefaultEmail != null) ? s.DefaultEmail.Value : null))
                    .ForMember(d => d.HasPhoto, o => o.MapFrom(s => s.Photo != null))
                    //.ForMember(d => d.DefaultTitle, o => o.MapFrom(s =>
                    //    s.Affiliations.Any(x => x.IsDefault) ? s.Affiliations.FirstOrDefault(x => x.IsDefault).JobTitles : null))
                ;
            }
        }

        public class ModelToGenerateDisplayName : Profile
        {
            protected override void Configure()
            {
                CreateMap<PersonApiModel, GenerateDisplayName>();
            }
        }

        public class ModelToUpdateCommand : Profile
        {
            protected override void Configure()
            {
                CreateMap<PersonApiModel, UpdatePerson>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                ;
            }
        }

        public class PagedQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Person>, PageOfPersonApiModel>();
            }
        }
    }
}