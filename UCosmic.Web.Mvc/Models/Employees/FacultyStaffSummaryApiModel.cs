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
        public string CountryCode { get; set; } // if country, 2-char code, null otherwise
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
        /* Global: Null */
        /* Place: PlaceId */
        public int? PlaceId { get; set; }

        /* Global: Total number of activities/people, worldwide */
        /* Place: Total number of activities/people for place */
        public int Count { get; set; }

        /* Global: Holds the total number of places (countries/waters) that contain activities/people */
        /* Place: 1 */
        public int CountOfPlaces { get; set; }

        /* Global: If establishment has activity types, count of types, worldwide.  Null otherwise. */
        /* Place: If place has activity types, count of types for place.  Null otherwise. */
        public ICollection<FacultyStaffTypeCountModel> TypeCounts { get; set; }

        /* Global: Holds counts for each place (countries/waters) */
        /* Place: Null */
        public ICollection<FacultyStaffPlaceCountModel> PlaceCounts { get; set; }

        public FacultyStaffSummaryModel()
        {
            TypeCounts = new Collection<FacultyStaffTypeCountModel>();
            PlaceCounts = new Collection<FacultyStaffPlaceCountModel>();
        }
    }


    public class FacultyStaffTrendCountModel
    {
        public int Year { get; set; }
        public int Count { get; set; }
    }

    public class FacultyStaffTrendModel
    {
        /* Global: Null */
        /* Place: PlaceId */
        public int? PlaceId { get; set; }

        /* Global: Yearly count of activities/people, worldwide */
        /* Place: Yearly count of activities/people for place */
        public ICollection<FacultyStaffTrendCountModel> TrendCounts { get; set; }

        public FacultyStaffTrendModel()
        {
            TrendCounts = new Collection<FacultyStaffTrendCountModel>();
        }
    }
}