using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTypeModel
    {
        public int ActivityTypeId { get; set; }
        public string Text { get; set; }
        public int Rank { get; set; }
    }

    public static class ActivityTypeProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeeActivityType, ActivityTypeModel>()
                    .ForMember(x => x.ActivityTypeId, o => o.MapFrom(s => s.Id))
                    .ForMember(x => x.Text, o => o.MapFrom(s => s.Type))
                ;
            }
        }
    }
}