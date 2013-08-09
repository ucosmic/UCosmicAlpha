using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Web.Mvc.Models
{
    public class FacultyStaffActivityType
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class FacultyStaffInstitutionInfoModel
    {
        public int? InstitutionId { get; set; }
        public bool InstitutionHasCampuses { get; set; }
        public FacultyStaffActivityType[] ActivityTypes { get; set; }
    }

    public class FacultyStaffFilterModel
    {
        public string FilterType { get; set; } // activities or people
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool UndatedActivities { get; set; }
        public int[] LocationIds { get; set; }
        public int[] ActivityTypes { get; set; }
        public int? InstitutionId { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class FacultyStaffTypeCountModel
    {
        public int TypeId { get; set; }
        public string Type { get; set; }
        public int Count { get; set; }
    }

    public class FacultyStaffPlaceCountModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public int Count { get; set; }
        public ICollection<FacultyStaffTypeCountModel> TypeCounts { get; set; }

        public FacultyStaffPlaceCountModel()
        {
            TypeCounts = new Collection<FacultyStaffTypeCountModel>();
        }
    }

    public class FacultyStaffPlaceTrendModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public ICollection<int> CountPerYear { get; set; }
    }

    public class FacultyStaffSummaryModel
    {
        public int TotalActivities { get; set; }
        public int TotalPlaces { get; set; }
        public ICollection<FacultyStaffPlaceCountModel> Counts { get; set; }

        public FacultyStaffSummaryModel()
        {
            Counts = new Collection<FacultyStaffPlaceCountModel>();
        }
    }

    public class FacultyStaffTrendModel
    {
        public ICollection<FacultyStaffPlaceTrendModel> PlaceTrendActivityCounts { get; set; }

        public FacultyStaffTrendModel()
        {
            PlaceTrendActivityCounts = new Collection<FacultyStaffPlaceTrendModel>();
        }
    }
}