using System;
using UCosmic.Domain.Establishments;
using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class StudentActivity
    {
        public string term { get; set; }
        public string status { get; set; }
        public string country { get; set; }
        public string level { get;set; }
        public string program {get;set;}
        public string institution { get; set; }
        public string campus { get; set; }
        public string localEstablishmentName { get; set; }
        public string foreignEstablishmentName { get; set; }
    }
}