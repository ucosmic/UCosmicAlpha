using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class StudentsBibNavModel
    {
        public bool Snapshot { get; set; }
        public bool Table { get; set; }
        public bool Maps { get; set; }
        public bool New { get; set; }
        public KeyValuePair<string, string> Other { get; set; }
        public string Custom { get; set; }
    }
}