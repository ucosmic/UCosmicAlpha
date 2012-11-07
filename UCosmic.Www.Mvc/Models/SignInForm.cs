using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UCosmic.Www.Mvc.Models
{
    public class SignInForm
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string ReturnUrl { get; set; }
        public bool RememberMe { get; set; }
    }
}