using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class IdentityController : Controller
    {
        private readonly ISignUsers _userSigner;
        private readonly IStorePasswords _passwords;
        private readonly IProcessQueries _queryProcessor;


        public IdentityController(ISignUsers userSigner
            , IStorePasswords passwords
            , IProcessQueries queryProcessor
        )
        {
            _userSigner = userSigner;
            _passwords = passwords;
            _queryProcessor = queryProcessor;
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

                // get tenancy cookie info
                var user = _queryProcessor.Execute(new UserByName(model.UserName)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        x => x.Person.Affiliations,
                    },
                });
                var tenancy = Mapper.Map<Tenancy>(user);

                /* Set the anchor link text to the employee personal info controller. */
                EmployeeModuleSettings employeeModuleSettings = _queryProcessor.Execute(
                    new RootEmployeeModuleSettingsByUserName(model.UserName));
                if (employeeModuleSettings != null)
                    Mapper.Map(employeeModuleSettings, tenancy);

                // set tenancy
                Response.Tenancy(tenancy);

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

                // reset tenancy cookie
                var oldTenancy = Request.Tenancy();
                var newTenancy = new Tenancy();
                if (oldTenancy != null) newTenancy.StyleDomain = oldTenancy.StyleDomain;
                Response.Tenancy(newTenancy);

                TempData.Flash("You have successfully been signed out of UCosmic.");
                return RedirectToAction(MVC.Identity.SignOut(returnUrl));
            }

            return View();
        }

    }
}
