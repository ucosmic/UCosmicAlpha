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

    public class FacultyStaffCountModel
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
        public ICollection<FacultyStaffCountModel> TypeCounts { get; set; }

        public FacultyStaffPlaceCountModel()
        {
            TypeCounts = new Collection<FacultyStaffCountModel>();
        }
    }

    public class FacultyStaffTrendModel
    {
        public ICollection<int> Counts { get; set; }
    }

    public class FacultyStaffPlaceTrendModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public ICollection<int> Counts { get; set; }
    }

    public class FacultyStaffActivitiesSummaryModel
    {
        public int TotalActivities { get; set; }
        public int TotalPlacesWithActivities { get; set; }
        public ICollection<FacultyStaffPlaceCountModel> PlaceActivityCounts { get; set; }
        public ICollection<FacultyStaffCountModel> WorldActivityCounts { get; set; }
        public ICollection<FacultyStaffPlaceTrendModel> PlaceTrendActivityCounts { get; set; }
        public ICollection<FacultyStaffTrendModel> WorldTrendActivityCounts { get; set; }

        public int TotalPeople { get; set; }
        public int TotalPlacesWithPeople { get; set; }
        public ICollection<FacultyStaffPlaceCountModel> PlacePeopleCounts { get; set; }
        public ICollection<FacultyStaffCountModel> WorldPeopleCounts { get; set; }
        public ICollection<FacultyStaffPlaceTrendModel> PlaceTrendPeopleCounts { get; set; }
        public ICollection<FacultyStaffTrendModel> WorldTrendPeopleCounts { get; set; }

        public FacultyStaffActivitiesSummaryModel()
        {
            PlaceActivityCounts = new Collection<FacultyStaffPlaceCountModel>();
            WorldActivityCounts = new Collection<FacultyStaffCountModel>();
            PlaceTrendActivityCounts = new Collection<FacultyStaffPlaceTrendModel>();
            WorldTrendActivityCounts = new Collection<FacultyStaffTrendModel>();

            PlacePeopleCounts = new Collection<FacultyStaffPlaceCountModel>();
            WorldPeopleCounts = new Collection<FacultyStaffCountModel>();
            PlaceTrendPeopleCounts = new Collection<FacultyStaffPlaceTrendModel>();
            WorldTrendPeopleCounts = new Collection<FacultyStaffTrendModel>();
        }
    }
}