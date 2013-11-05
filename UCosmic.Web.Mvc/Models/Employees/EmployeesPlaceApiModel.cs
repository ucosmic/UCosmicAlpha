using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeesPlaceApiModel
    {
        public EmployeesPlaceApiModel()
        {
            ActivityPersonIds = new List<int>();
            ActivityIds = new List<int>();
        }

        public int EstablishmentId { get; set; }
        public int? PlaceId { get; set; }
        public string PlaceName { get; set; }
        public bool IsCountry { get; set; }
        public string CountryCode { get; set; }
        public IEnumerable<int> ActivityPersonIds { get; set; }
        public IEnumerable<int> ActivityIds { get; set; }
        public IEnumerable<EmployeeActivityTypeCountModel> ActivityTypes { get; set; }
        public IEnumerable<EmployeeActivityYearCountModel> Years { get; set; }
    }

    public static class EmployeesPlaceApiProfiler
    {
        public class ViewToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeePlacesView, EmployeesPlaceApiModel>();
            }
        }
    }
}