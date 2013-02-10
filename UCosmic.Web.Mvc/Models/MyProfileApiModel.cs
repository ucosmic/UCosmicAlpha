using AutoMapper;
using UCosmic.Domain.People;


namespace UCosmic.Web.Mvc.Models
{
    public class MyProfileApiModel
    {
        /* From Person */
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }

        /* From Employee */
        public int? FacultyRankId { get; set; }
        public string AdministrativeAppointments { get; set; }
        public string JobTitles { get; set; }
    }

    public static class MyProfileApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, MyProfileApiModel>()
                    .ForMember(d => d.FacultyRankId, o => o.MapFrom(s =>
                        (s.Employee != null && s.Employee.FacultyRank != null) ? s.Employee.FacultyRank.Id : (int?)null))
                    .ForMember(d => d.AdministrativeAppointments, o => o.MapFrom(s =>
                        (s.Employee != null) ? s.Employee.AdministrativeAppointments : null))
                    .ForMember(d => d.JobTitles, o => o.MapFrom(s =>
                        (s.Employee != null) ? s.Employee.JobTitles : null))
                ;
            }
        }

        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileApiModel, UpdateMyProfile>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }
    }
}