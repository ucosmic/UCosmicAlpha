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
        public string DefaultEmailAddress { get; set; }
    }

    public class PageOfPersonApiModel : PageOf<PersonApiModel> { }

    public static class PersonApiModelProfiler
    {
        public static readonly IEnumerable<Expression<Func<Person, object>>> EagerLoads =
            new Expression<Func<Person, object>>[]
            {
                x => x.Emails,
                x => x.User,
            };

        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, PersonApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.UserId, o => o.MapFrom(s => s.User == null ? (int?)null : s.User.RevisionId))
                    .ForMember(d => d.DefaultEmailAddress, o => o.MapFrom(s =>
                        (s.DefaultEmail != null) ? s.DefaultEmail.Value : null))
                ;
            }
        }

        public class ModelToGenerateDisplayNameProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PersonApiModel, GenerateDisplayName>();
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Person>, PageOfPersonApiModel>();
            }
        }
    }
}