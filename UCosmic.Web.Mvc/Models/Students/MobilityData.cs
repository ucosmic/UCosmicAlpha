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
        public int? institutionId { get; set; } //Institution handling the study abroad
        public int? studentEstablishmentId { get; set; } //Student's Campus
        public int? foreignEstablishmentId { get; set; } //Where the student is going
    }

  /*  public class Student
    {
        public IList<StudentAffiliationData> affiliation;
        public IList<StudentInformationData> info;
        public IList<StudentLevelData> level;
        public IList<StudentMobilityData>
    }*/

}