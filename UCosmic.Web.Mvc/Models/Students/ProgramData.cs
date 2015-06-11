using System;

namespace UCosmic.Web.Mvc.Models
{
    public class StudentProgramData
    {
        public int _id { get; set; }
        public string code { get; set; }
        public string name { get; set; }
        public bool isStandard {get; set; }
        public int establishmentId { get; set; }
    }

}