using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeeSettingsFacultyRankApiModel
    {
        public int FacultyRankId { get; set; }
        public int EstablishmentId { get; set; }
        public string Text { get; set; }
        public int? Rank { get; set; }
    }

    public static class EmployeeSettingsFacultyRankProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeeFacultyRank, EmployeeSettingsFacultyRankApiModel>()
                    .ForMember(d => d.FacultyRankId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Text, o => o.MapFrom(s => s.Rank))
                    .ForMember(d => d.Rank, o => o.MapFrom(s => s.Number))
                ;
            }
        }
    }
}