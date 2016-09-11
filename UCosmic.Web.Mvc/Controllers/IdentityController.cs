using System;
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
using System.Collections.Generic;
using System.Web;
using System.Web.Routing;
using System.Net.Http;
using System.Net.Http.Headers;

namespace UCosmic.Web.Mvc.Controllers
{
    public class SignOnServices
    {
        public SignOnServices(IProcessQueries queryProcessor
            , IProvideSaml2Service samlServiceProvider
            , IManageConfigurations configurationManager
            , IHandleCommands<UpdateSamlSignOnMetadata> commandHandler
        )
        {
            QueryProcessor = queryProcessor;
            SamlServiceProvider = samlServiceProvider;
            ConfigurationManager = configurationManager;
            CommandHandler = commandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public IProvideSaml2Service SamlServiceProvider { get; private set; }
        public IManageConfigurations ConfigurationManager { get; private set; }
        public IHandleCommands<UpdateSamlSignOnMetadata> CommandHandler { get; private set; }
    }
    public class Firebase_roles {
        public string name {get; set;}
        public string for_establishment {get; set;}
    }
    public partial class IdentityController : Controller
    {
        private readonly SignOnServices _services;

        //private static readonly string Area = MVC.Identity.Name;
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
            , SignOnServices services
        )
        {
            _userSigner = userSigner;
            _passwords = passwords;
            _queryProcessor = queryProcessor;
            _updateSamlMetadata = updateSamlMetadata;
            //_samlServiceProvider = samlServiceProvider;
            _configurationManager = configurationManager;
            _services = services;
        }
        [GET("sign-in_2")]
        [ValidateSigningReturnUrl]
        public virtual ActionResult SignIn_2(string returnUrl)
        {

            Run_Firebase_get("test", "test2");
            // detect SAML SSO from skin cookie
            var tenancy = Request.Tenancy();
            if (tenancy != null && !string.IsNullOrWhiteSpace(tenancy.StyleDomain))
            {
                // get the establishment for this skin
                var establishment = _queryProcessor.Execute(
                    new EstablishmentByDomain(tenancy.StyleDomain)
                    {
                        EagerLoad = new Expression<Func<Establishment, object>>[]
                        {
                            e => e.SamlSignOn,
                        }
                    }
                );
                if (establishment != null && establishment.HasSamlSignOn())
                {
                    return PushToSamlSsoExternal_2(establishment, returnUrl);

                    // wait for the authn response
                    //return new EmptyResult();
                }
            }
            ViewBag.userName = User.Identity.Name.ToLower();

            var model = new SignInForm();
#if DEBUG
            model.ShowPasswordField = true;
#endif

            return View(model);
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
                var establishment = _queryProcessor.Execute(
                    new EstablishmentByDomain(tenancy.StyleDomain)
                    {
                        EagerLoad = new Expression<Func<Establishment, object>>[]
                        {
                            e => e.SamlSignOn,
                        }
                    }
                );
                if (establishment != null && establishment.HasSamlSignOn())
                {
                    if (establishment.OfficialName == "University of South Florida System")
                    {
                        return PushToSamlSsoExternal_2(establishment, returnUrl);
                    }
                    else
                    {
                        return PushToSamlSsoExternal(establishment, returnUrl);
                    }

                    // wait for the authn response
                    //return new EmptyResult();
                }
            }
            ViewBag.userName = User.Identity.Name.ToLower();

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
                    if (establishment.OfficialName == "University of South Florida System")
                    {
                        return PushToSamlSsoExternal_2(establishment, model.ReturnUrl);
                    }
                    else
                    {
                        return PushToSamlSsoExternal(establishment, model.ReturnUrl);
                    }
                    //return PushToSamlSsoExternal(establishment, model.ReturnUrl);
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
            ViewBag.userName = User.Identity.Name.ToLower();

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




            var tokenGenerator = new Firebase.TokenGenerator("pXxnmMQ4YPK97bFKoN4JzGOJT40nOhM921z3JKl6");
            IList<Firebase_roles> roles = new List<Firebase_roles>();
            
            if(user.Grants.Select(x => x.Role.Name == "Institutional Student Supervisor").Count() > 1){
                roles.Add(new Firebase_roles{name = "Institutional Student Supervisor", for_establishment = user.TenantId.ToString()});
            }
            if(user.Grants.Select(x => x.Role.Name == "Institutional Student Manager").Count() > 1){
                roles.Add(new Firebase_roles { name = "Institutional Student Manager", for_establishment = user.TenantId.ToString() });
            }

            var authPayload = new Dictionary<string, object>()
            {
              { "uid", "custom:" + tenancy.UserId },
              { "role", roles }
            };
            string token = tokenGenerator.CreateToken(authPayload);
            var cookie = new HttpCookie("firebase_token", token)
            {
                Expires = DateTime.UtcNow.AddDays(60),
            };

            // write the cookie
            Response.SetCookie(cookie);

            return RedirectToAction(MVC.Tenancy.Tenant(tenancy.StyleDomain, returnUrl));
        }

        [GET("sign-out")]
        [ValidateSigningReturnUrl]
        public virtual ActionResult SignOut(string returnUrl)
        {
            // if user is signed on, sign out and redirect back to this action
            if (!string.IsNullOrWhiteSpace(User.Identity.Name))
            {
                var user = _queryProcessor.Execute(new UserByName(User.Identity.Name)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        x => x.Person.Affiliations.Select(y => y.Establishment),
                    },
                });
                var tenancy = Mapper.Map<Tenancy>(user);

                // set tenancy
                Response.Tenancy(tenancy);
                _userSigner.SignOff();

                // reset tenancy cookie
                //var oldTenancy = Request.Tenancy();
                //var newTenancy = new Tenancy();
                //if (oldTenancy != null) newTenancy.StyleDomain = oldTenancy.StyleDomain;
                //Response.Tenancy(newTenancy);

                TempData.Flash("You have successfully been signed out of UCosmic.");
                return RedirectToAction(MVC.Identity.SignOut(returnUrl));
            }

            return View();
        }

        [NonAction]
        private ActionResult PushToSamlSsoExternal_2(Establishment establishment, string returnUrl)
        {
            

            if (establishment != null)
            {
                PushToSamlSso(establishment, Request.Url.AbsoluteUri);
                return new EmptyResult();
            }
            return new HttpStatusCodeResult(400);
        }
        [NonAction]
        private void PushToSamlSso(Establishment establishment, string returnUrl)
        {
            if (establishment == null) return;

            //Run_Firebase_test(establishment, "request_1");
            // update the provider metadata
            _services.CommandHandler.Handle(
                new UpdateSamlSignOnMetadata
                {
                    EstablishmentId = establishment.RevisionId,
                }
            );

            // clear the email from temp data
            //TempData.SigningEmailAddress(null);

            // send the authn request

            var user = _queryProcessor.Execute(new UserByName(User.Identity.Name)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                    {
                        x => x.Person.Affiliations.Select(y => y.Establishment),
                    },
            });
            var tenancy = Mapper.Map<Tenancy>(user);
            _services.SamlServiceProvider.SendAuthnRequest(
                establishment.SamlSignOn.SsoLocation,
                establishment.SamlSignOn.SsoBinding.AsSaml2SsoBinding(),
                //"https://preview.ucosmic.com/sign-on/saml/2",
                "https://alpha.ucosmic.com/sign-on/saml/2",
                "https://alpha.ucosmic.com/sign-on/saml/2/post",
                HttpContext
            );

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

                var callbackUrl = returnUrl ?? Url.Action(MVC.People.Me());
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
                    // do not allow users to impersonate themselves
                    if (userImpersonating.Identity.Name.Equals(userToImpersonate.Name, StringComparison.OrdinalIgnoreCase))
                        if (Request.UrlReferrer != null)
                            return Redirect(Request.UrlReferrer.PathAndQuery);
                        else RedirectToAction(MVC.People.Me());

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

                    var returnUrl = Url.Action(MVC.People.Me());
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
            return RedirectToAction(MVC.People.Me());
        }
        public async void Run_Firebase_test(Object saml_response, string test_number)//(CancellationToken cancellationToken)
        {


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
                HttpResponseMessage response = await client.PutAsJsonAsync("Test/Checks/" + test_number + ".json", saml_response);

            }
        }
        public async void Run_Firebase_get(string test_number1, string test_number)//(CancellationToken cancellationToken)
        {


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
                //HttpResponseMessage response = await client.PutAsJsonAsync("Test/Checks/" + test_number + ".json", saml_response);
                HttpResponseMessage response = await client.GetAsync("Test/Checks");
                if (response.IsSuccessStatusCode)
                {
                    var x = response.Content.ReadAsStringAsync().Result;
                    //x = x;
                }
                else
                {
                    //return "";
                }
            }
        }

    }
}
