using System;
using UCosmic.Domain.Establishments;
using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class CountryMobility
    {
        public string country { get; set; }
        public string countryCode { get; set; }
        public int inbound { get; set; }
        public int outbound { get; set; }
    }
}