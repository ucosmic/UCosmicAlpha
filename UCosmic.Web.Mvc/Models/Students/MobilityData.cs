using System;

namespace UCosmic.Web.Mvc.Models
{
    public class StudentMobilityData
    {
        public int _id { get; set; }
        public int studentId { get; set; }
        public string status { get; set; }//in/out
        public int levelId {get; set;}
        public int termId {get; set;}
        public int placeId {get; set;}
        public int programId { get; set; }
        public int? establishmentId { get; set; } //maybe make this optional?
        public int? foreignEstablishmentId { get; set; } //maybe make this optional?
    }

}