using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class MyProfileApiModel
    {
        public int PersonId { get; set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        public bool HasPhoto { get; set; }
        public string PreferredTitle { get; set; }
        public ICollection<MyAffiliationApiModel> Affiliations { get; set; }

        public bool StartInEdit { get; set; }
        public string StartTabName { get; set; }

        public bool DefaultEstablishmentHasCampuses { get; set; }
    }

    public static class MyProfileApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, MyProfileApiModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId) )
                    .ForMember(d => d.HasPhoto, o => o.MapFrom(s => s.Photo != null))
                    .ForMember(d => d.PreferredTitle, o => o.MapFrom(s => (s.Employee != null) ? s.Employee.JobTitles : null))
                    .ForMember(d => d.StartInEdit, o => o.Ignore())
                    .ForMember(d => d.StartTabName, o => o.Ignore())
                    .ForMember(d => d.DefaultEstablishmentHasCampuses, o => o.Ignore())
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileApiModel, UpdateMyProfile>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.JobTitles, o => o.MapFrom(s => s.PreferredTitle))
                ;
            }
        }

        public class ModelToGenerateDisplayNameProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileApiModel, GenerateDisplayName>();
            }
        }


    }
}