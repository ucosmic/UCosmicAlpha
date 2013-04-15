using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeeActivityTypeApiModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int Rank { get; set; }
    }

    public static class EmployeeActivityApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeeActivityType, EmployeeActivityTypeApiModel>();
            }
        }
    }
}