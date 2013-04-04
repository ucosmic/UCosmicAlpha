using System;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class IdentityController : Controller
    {
        private readonly ISignUsers _userSigner;
        private readonly IStorePasswords _passwords;
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateSamlSignOnMetadata> _updateSamlMetadata;
        //private readonly IProvideSaml2Service _samlServiceProvider;
        private readonly IManageConfigurations _configurationManager;

        public IdentityController(ISignUsers userSigner
            , IStorePasswords passwords
            , IProcessQueries queryProcessor
            , IHandleCommands<UpdateSamlSignOnMetadata> updateSamlMetadata
            //, IProvideSaml2Service samlServiceProvider
            , IManageConfigurations configurationManager
        )
        {
            _userSigner = userSigner;
            _passwords = passwords;
            _queryProcessor = queryProcessor;
            _updateSamlMetadata = updateSamlMetadata;
            //_samlServiceProvider = samlServiceProvider;
            _configurationManager = configurationManager;
        }

        [GET("sign-in")]
        [ValidateSigningReturnUrl]
        public virtual ActionResult SignIn(string returnUrl)
        {
            // detect SAML SSO from skin cookie
            var tenancy = Request.Tenancy();
            if (tenancy != null && !string.IsNullOrWhiteSpace(tenancy.StyleDomain))
            {
                // get the establishment for this skin
                var styleDomain = tenancy.StyleDomain;
                if (!styleDomain.StartsWith("www."))
                    styleDomain = "www." + styleDomain;
                var establishment = _queryProcessor.Execute(
                    new EstablishmentByUrl(styleDomain)
                    {
                        EagerLoad = new Expression<Func<Establishment, object>>[]
                        {
                            e => e.SamlSignOn,
                        }
                    }
                );
                if (establishment != null && establishment.HasSamlSignOn())
                {
                    return PushToSamlSsoExternal(establishment, returnUrl);

                    // wait for the authn response
                    //return new EmptyResult();
                }
            }

            var model = new SignInForm();
#if DEBUG
            model.ShowPasswordField = true;
#endif

            return View(model);
        }

        [POST("sign-in")]
        public virtual ActionResult SignIn(SignInForm model)
        {
            if (ModelState.IsValid)
            {
                // check for saml integration
                var establishment = _queryProcessor.Execute(new EstablishmentByEmail(model.UserName.GetEmailDomain())
                {
                    EagerLoad = new Expression<Func<Establishment, object>>[]
                    {
                        x => x.SamlSignOn,
                    }
                });
                if (establishment != null && establishment.HasSamlSignOn())
                {
                    return PushToSamlSsoExternal(establishment, model.ReturnUrl);
                }
                if (!string.IsNullOrWhiteSpace(model.Password) && _passwords.Validate(model.UserName, model.Password))
                {
                    _userSigner.SignOn(model.UserName, model.RememberMe);

                    return RedirectToAction(MVC.Identity.Tenantize(model.ReturnUrl));
                }
                if (string.IsNullOrWhiteSpace(model.Password))
                {
                    model.ShowPasswordField = true;
                }
            }

            return View(model);
        }

        [GET("sign-in/tenantize")]
        public virtual ActionResult Tenantize(string returnUrl)
        {
            if (string.IsNullOrWhiteSpace(User.Identity.Name))
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            // get tenancy cookie info
            var user = _queryProcessor.Execute(new UserByName(User.Identity.Name)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations.Select(y => y.Establishment),
                },
            });
            if (user == null) return new HttpNotFoundResult();

            var tenancy = Mapper.Map<Tenancy>(user);

            /* Set the anchor link text to the employee personal info controller. */
            var employeeModuleSettings = _queryProcessor.Execute(
                new EmployeeModuleSettingsByUserName(user.Name));
            if (employeeModuleSettings != null)
                Mapper.Map(employeeModuleSettings, tenancy);

            // set tenancy
            Response.Tenancy(tenancy);

            TempData.Flash(string.Format("You are now signed on to UCosmic as {0}.", User.Identity.Name));

            if (string.IsNullOrWhiteSpace(returnUrl) || returnUrl == "/")
                returnUrl = _userSigner.DefaultSignedOnUrl;

            //return Redirect(returnUrl);
            return RedirectToAction(MVC.Tenancy.Tenant(tenancy.StyleDomain, returnUrl));
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

        [NonAction]
        private ActionResult PushToSamlSsoExternal(Establishment establishment, string returnUrl)
        {
            if (establishment != null)
            {
                // update the provider metadata
                _updateSamlMetadata.Handle(
                    new UpdateSamlSignOnMetadata
                    {
                        EstablishmentId = establishment.RevisionId,
                    }
                );

                var callbackUrl = returnUrl ?? Url.Action(MVC.MyProfile.Index());
                callbackUrl = MakeAbsoluteUrl(callbackUrl);

                var redirectUrl = "https://develop.ucosmic.com";
                if (_configurationManager.SamlRealServiceProviderEntityId.StartsWith("https://preview.ucosmic.com"))
                {
                    redirectUrl = "https://preview.ucosmic.com";
                }

                redirectUrl = string.Format("{0}/sign-on/alpha-proxy/{1}/?returnUrl={2}", redirectUrl,
                    establishment.RevisionId, Server.UrlEncode(callbackUrl));
                return Redirect(redirectUrl);
            }

            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        //[NonAction]
        //private void PushToSamlSsoInternal(Establishment establishment, string returnUrl)
        //{
        //    if (establishment == null) return;

        //    // update the provider metadata
        //    _updateSamlMetadata.Handle(
        //        new UpdateSamlSignOnMetadata
        //        {
        //            EstablishmentId = establishment.RevisionId,
        //        }
        //    );

        //    // clear the email from temp data
        //    //TempData.SigningEmailAddress(null);

        //    var callbackUrl = returnUrl ?? Url.Action(MVC.MyProfile.Index());
        //    //callbackUrl = MakeAbsoluteUrl(callbackUrl);

        //    // send the authn request
        //    _samlServiceProvider.SendAuthnRequest(
        //        establishment.SamlSignOn.SsoLocation,
        //        establishment.SamlSignOn.SsoBinding.AsSaml2SsoBinding(),
        //        _configurationManager.SamlRealServiceProviderEntityId,
        //        callbackUrl,
        //        HttpContext
        //    );
        //}

        [NonAction]
        private string MakeAbsoluteUrl(string relativeUrl)
        {
            return Request.Url != null
            ? string.Format("{0}{1}{2}{3}{4}",
                Request.Url.Scheme,
                Uri.SchemeDelimiter,
                Request.Url.Host,
                (Request.Url.IsDefaultPort ? "" : ":" + Request.Url.Port),
                relativeUrl
                ) : null;
        }

        [POST("sign-over")]
        [Authorize(Roles = RoleName.UserImpersonators)]
        public virtual ActionResult SignOver(string userName)
        {
            if (!string.IsNullOrWhiteSpace(userName))
            {
                var userImpersonating = Session.UserImpersonating() ?? User;
                var userToImpersonate = _queryProcessor.Execute(new UserByName(userName)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        x => x.Grants.Select(y => y.Role),
                    }
                });
                if (userToImpersonate != null)
                {
                    // cannot impersonate certain users when not already in that role
                    ViewBag.UserToImpersonate = userName;
                    if (userToImpersonate.IsInRole(RoleName.AuthenticationAgent) && !userImpersonating.IsInRole(RoleName.AuthenticationAgent))
                        ViewBag.AuthenticationAgentFail = new object();
                    if (userToImpersonate.IsInRole(RoleName.AuthorizationAgent) && !userImpersonating.IsInRole(RoleName.AuthorizationAgent))
                        ViewBag.AuthorizationAgentFail = new object();
                    if (userToImpersonate.IsInRole(RoleName.SecurityAdministrator) && !userImpersonating.IsInRole(RoleName.SecurityAdministrator)
                        && !userImpersonating.IsInRole(RoleName.AuthenticationAgent))
                        ViewBag.SecurityAdministratorFail = new object();
                    if (ViewBag.AuthenticationAgentFail != null ||
                        ViewBag.AuthorizationAgentFail != null ||
                        ViewBag.SecurityAdministratorFail != null)
                        return View(MVC.Identity.Views.SignOverFail);

                    // can only impersonate users that match your tenancy access
                    if (!userImpersonating.IsInRole(RoleName.AuthenticationAgent))
                    {
                        var tenantUsers = _queryProcessor.Execute(new MyUsersByKeyword(userImpersonating) { PageSize = int.MaxValue });
                        if (!tenantUsers.Any(x => x.Name.Equals(userName)))
                        {
                            ViewBag.TenantPricacyFail = new object();
                            return View(MVC.Identity.Views.SignOverFail);
                        }
                    }

                    var roleNames = _queryProcessor.Execute(new RolesGrantedToUserName(userImpersonating, userImpersonating.Identity.Name)).Select(x => x.Name);
                    Session.UserImpersonating(userImpersonating, roleNames);
                    _userSigner.SignOn(userName);
                    TempData.Flash(string.Format("You are now signed on to UCosmic as {0}.", userName));
                    //TempData.UserImpersonating(true);

                    var returnUrl = Url.Action(MVC.MyProfile.Index());
                    return RedirectToAction(MVC.Identity.Tenantize(returnUrl));
                }
            }

            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [Authorize]
        [GET("sign-over/undo")]
        public virtual ActionResult UndoSignOver()
        {
            var userImpersonating = Session.UserImpersonating();
            if (userImpersonating != null)
            {
                Session.UserImpersonating(null);
                _userSigner.SignOn(userImpersonating.Identity.Name);
                var returnUrl = Url.Action(MVC.Users.Index());
                return RedirectToAction(MVC.Identity.Tenantize(returnUrl));
            }
            return RedirectToAction(MVC.MyProfile.Index());
        }

    }
}
