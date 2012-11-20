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
            , IStorePasswords passwords
        )
        {
            _userSigner = userSigner;
            _passwords = passwords;
        }

        [GET("sign-in")]
        [ValidateSigningReturnUrl]
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
                TempData.Flash(string.Format("You are now signed on to UCosmic as {0}.", model.UserName));
                return Redirect(model.ReturnUrl ?? _userSigner.DefaultSignedOnUrl);
            }

            return View();
        }

        [GET("sign-out")]
        [ValidateSigningReturnUrl]
        public virtual ActionResult SignOut(string returnUrl)
        {
            // if user is signed on, sign out and redirect back to this action
            if (!string.IsNullOrWhiteSpace(User.Identity.Name))
            {
                _userSigner.SignOff();
                TempData.Flash("You have successfully been signed out of UCosmic.");
                return RedirectToAction(MVC.Identity.SignOut(returnUrl));
            }

            return View();
        }

    }
}
