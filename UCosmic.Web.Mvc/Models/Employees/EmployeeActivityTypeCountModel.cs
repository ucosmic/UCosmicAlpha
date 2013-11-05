using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeeActivityTypeCountModel
    {
        public EmployeeActivityTypeCountModel()
        {
            ActivityPersonIds = new List<int>();
            ActivityIds = new List<int>();
        }

        public int ActivityTypeId { get; set; }
        public string Text { get; set; }
        public int Rank { get; set; }
        public bool HasIcon { get; set; }
        public IEnumerable<int> ActivityPersonIds { get; set; }
        public IEnumerable<int> ActivityIds { get; set; }
    }

    public static class EmployeeActivityTypeCountProfiler
    {
        public class ViewToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeePlaceActivityTypesView, EmployeeActivityTypeCountModel>();
            }
        }
    }
}