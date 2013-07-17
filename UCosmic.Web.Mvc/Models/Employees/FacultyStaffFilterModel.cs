using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UCosmic.Web.Mvc.Models
{
    public class FacultyStaffFilterModel
    {
        public string FilterType { get; set; } // activities or people
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int[] LocationIds { get; set; }
        public int[] TypeIds { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class FacultyStaffResultsModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public int Count { get; set; }
    }
}