using System.ComponentModel.DataAnnotations;

namespace UCosmic.Web.Mvc.Models
{
    public class SignInForm
    {
        [Required(ErrorMessage = "Email Address is required.")]
        public string UserName { get; set; }
        public string Password { get; set; }
        public string ReturnUrl { get; set; }
        public bool RememberMe { get; set; }
        public bool ShowPasswordField { get; set; }
    }
}