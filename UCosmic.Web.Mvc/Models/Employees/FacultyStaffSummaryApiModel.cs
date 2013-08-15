using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Web.Mvc.Models
{
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

    public class FacultyStaffSummaryModel
    {
        /* Holds the total number of activities or people, worldwide */
        public int GlobalCount { get; set; }

        /* Holds the total number of locations (countries/waters) that contain activities/people */
        public int CountOfPlaces { get; set; }

        /* If establishment has activity types, this holds count of those types, worldwide */
        public ICollection<FacultyStaffTypeCountModel> GlobalTypeCounts { get; set; }

        /* Holds counts for all locations (countries/waters), worldwide */
        public ICollection<FacultyStaffPlaceCountModel> PlaceCounts { get; set; }

        public FacultyStaffSummaryModel()
        {
            GlobalTypeCounts = new Collection<FacultyStaffTypeCountModel>();
            PlaceCounts = new Collection<FacultyStaffPlaceCountModel>();
        }
    }


    public class FacultyStaffTrendDataModel
    {
        public int Year { get; set; }
        public int Count { get; set; }
    }

    public class FacultyStaffPlaceTrendModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public ICollection<FacultyStaffTrendDataModel> Data { get; set; }
    }

    public class FacultyStaffTrendModel
    {
        public ICollection<FacultyStaffTrendDataModel> GlobalData { get; set; }
        public ICollection<FacultyStaffPlaceTrendModel> PlaceTrendActivityCounts { get; set; }

        public FacultyStaffTrendModel()
        {
            GlobalData = new Collection<FacultyStaffTrendDataModel>();
            PlaceTrendActivityCounts = new Collection<FacultyStaffPlaceTrendModel>();
        }
    }
}