using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class IdentityController : Controller
    {
        private readonly ISignUsers _userSigner;
        private readonly IStorePasswords _passwords;

        public IdentityController(ISignUsers userSigner
            , IStorePasswords passwords)
        {
            _userSigner = userSigner;
            _passwords = passwords;
        }

        [GET("sign-in")]
        public virtual ActionResult SignIn(string returnUrl)
        {
            return View();
        }

        [POST("sign-in")]
        public virtual ActionResult SignIn(SignInForm model)
        {
            if (_passwords.Validate(model.UserName, model.Password))
            {
                _userSigner.SignOn(model.UserName, model.RememberMe);
            }

            return View();
        }
    }
}
