using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeeActivityYearCountModel
    {
        public EmployeeActivityYearCountModel()
        {
            ActivityPersonIds = new List<int>();
            ActivityIds = new List<int>();
        }

        public int Year { get; set; }
        public IEnumerable<int> ActivityPersonIds { get; set; }
        public IEnumerable<int> ActivityIds { get; set; }
    }

    public static class EmployeeActivityYearCountProfiler
    {
        public class ViewToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeePlaceActivityYearView, EmployeeActivityYearCountModel>();
            }
        }
    }
}