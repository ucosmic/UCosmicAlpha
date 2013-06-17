using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.People;


namespace UCosmic.Web.Mvc.Models
{
    public class MyProfileAffiliationApiModel
    {
        public int EstablishmentId { get; set; }
        public string Establishment { get; set; }
        public string JobTitles { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsAcknowledged { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public bool IsClaimingInternationalOffice { get; set; }
        public bool IsClaimingAdministrator { get; set; }
        public bool IsClaimingFaculty { get; set; }
        public bool IsClaimingStaff { get; set; }
        public int? CampusId { get; set; }
        public string Campus { get; set; }
        public int? CollegeId { get; set; }
        public string College { get; set; }
        public int? DepartmentId { get; set; }
        public string Department { get; set; }
        public int? FacultyRankId { get; set; }
        public string FacultyRank { get; set; }
    }

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
        public ICollection<MyProfileAffiliationApiModel> Affiliations { get; set; }
    }

    public static class MyProfileApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Affiliation, MyProfileAffiliationApiModel>()
                    .ForMember(d => d.CampusId, o => o.Ignore())
                    .ForMember(d => d.Campus, o => o.Ignore())
                    .ForMember(d => d.College, o => o.Ignore())
                    .ForMember(d => d.Department, o => o.Ignore())
                    .ForMember(d => d.FacultyRank, o => o.Ignore())
                    ;

                CreateMap<Person, MyProfileApiModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId) )
                    .ForMember(d => d.HasPhoto, o => o.MapFrom(s => s.Photo != null))
                    .ForMember(d => d.PreferredTitle, o => o.MapFrom(s => (s.Employee != null) ? s.Employee.JobTitles : null))
                    ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileAffiliationApiModel, UpdatePerson.Affiliation>();

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