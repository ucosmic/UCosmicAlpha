using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentWelcomeMessageConfigurationModel
    {
        public string WelcomeMessage { get; set; }
        public bool Status { get; set; }
        public string Heading { get; set; }
        public bool IsDraft { get; set; }
        public string Content { get; set; }
    }
}