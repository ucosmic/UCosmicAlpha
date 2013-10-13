using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Web.Mvc.Models
{
    public class FacultyStaffActivityType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string CssColor { get; set; }
    }

    public class FacultyStaffInstitutionInfoModel
    {
        public int InstitutionId { get; set; }
        public string InstitutionOfficialName { get; set; }
        public bool InstitutionHasCampuses { get; set; }
        public int[] InstitutionCampusIds { get; set; }
        public string[] InstitutionCampusOfficialNames { get; set; }
        public FacultyStaffActivityType[] ActivityTypes { get; set; }
    }

    public class FacultyStaffFilterModel
    {
        public int EstablishmentId { get; set; }

        public string FilterType { get; set; } // activities or people

        public int[] LocationIds { get; set; }

        public int[] ActivityTypes { get; set; }

        public bool IncludeDegrees { get; set; } // people only

        public string[] Tags { get; set; }

        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public bool NoUndated { get; set; }

        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class FacultyStaffResult
    {
        public int PersonId { get; set; }
        public string PersonName { get; set; }
        public string PersonDepartment { get; set; }
        public string PersonEmail { get; set; }
        public int? ActivityId { get; set; }
        public string ActivityTitle { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public string ActivityDate { get; set; }
        public string ActivityDescription { get; set; }
        public DateTime SortDate { get; set; }
    }

    public class FacultyStaffPlaceResult
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public ICollection<FacultyStaffResult> Results { get; set; }
        public int PeopleCount { get; set; }

        public FacultyStaffPlaceResult()
        {
            Results = new Collection<FacultyStaffResult>();
        }
    }

    public class FacultyStaffSearchResults
    {
        public ICollection<FacultyStaffPlaceResult> PlaceResults { get; set; }

        public FacultyStaffSearchResults()
        {
            PlaceResults = new Collection<FacultyStaffPlaceResult>();
        }
    }

}