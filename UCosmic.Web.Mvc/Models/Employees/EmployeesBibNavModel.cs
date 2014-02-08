using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeesBibNavModel
    {
        public bool Activities { get; set; }
        public bool Degrees { get; set; }
        public bool FindAnExpert { get; set; }
        public bool GeographicExpertise { get; set; }
        public bool LanguageExpertise { get; set; }
        public KeyValuePair<string, string> Other { get; set; }
        public string Custom { get; set; }
    }
}