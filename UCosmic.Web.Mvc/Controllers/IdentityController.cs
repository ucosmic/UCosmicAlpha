using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;
using UCosmic.Saml;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class IdentityController : Controller
    {
        private readonly ISignUsers _userSigner;
        private readonly IStorePasswords _passwords;
        private readonly IProcessQueries _queryProcessor;
        private readonly IManageConfigurations _configurationManager;
        private readonly IStoreSamlCertificates _samlCertificates;

        public IdentityController(ISignUsers userSigner
            , IStorePasswords passwords
            , IProcessQueries queryProcessor
            , IManageConfigurations configurationManager
            , IStoreSamlCertificates samlCertificates
        )
        {
            _userSigner = userSigner;
            _passwords = passwords;
            _queryProcessor = queryProcessor;
            _configurationManager = configurationManager;
            _samlCertificates = samlCertificates;
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
                    new EmployeeModuleSettingsByUserName(model.UserName));
                if (employeeModuleSettings != null)
                    Mapper.Map(employeeModuleSettings, tenancy);

                // set tenancy
                Response.Tenancy(tenancy);

                TempData.Flash(string.Format("You are now signed on to UCosmic as {0}.", model.UserName));
                var returnUrl = model.ReturnUrl;
                if (string.IsNullOrWhiteSpace(returnUrl) || returnUrl == "/")
                {
                    returnUrl = _userSigner.DefaultSignedOnUrl;
                }
                return Redirect(returnUrl);
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

        [GET("sign-on/saml/2/metadata")]
        public virtual PartialViewResult RealSamlMetadata(string contentType = null)
        {
            return Get(contentType);
        }

        [GET("sign-on/saml/2/metadata/develop")]
        public virtual PartialViewResult TestSamlMetadata(string contentType = null)
        {
            return Get(contentType, false);
        }

        [NonAction]
        private PartialViewResult Get(string contentType, bool isReal = true)
        {
            var samlCertificates = isReal
                ? _samlCertificates // use real cert by default
                : new TestSamlCertificateStorage(_configurationManager);
            var encryptionCertificate = samlCertificates.GetEncryptionCertificate();
            var signingCertificate = samlCertificates.GetSigningCertificate();
            var model = new SamlServiceProviderEntityDescriptor
            {
                SigningX509SubjectName = signingCertificate.SubjectName.Name,
                SigningX509Certificate = Convert.ToBase64String(signingCertificate.RawData),
                EncryptionX509SubjectName = encryptionCertificate.SubjectName.Name,
                EncryptionX509Certificate = Convert.ToBase64String(encryptionCertificate.RawData),
                EntityId = isReal
                    ? _configurationManager.SamlRealServiceProviderEntityId
                    : _configurationManager.SamlTestServiceProviderEntityId,
            };

            // NOTE: http://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf section 4.1.1
            Response.ContentType = "application/samlmetadata+xml";
            if ("xml".Equals(contentType, StringComparison.OrdinalIgnoreCase))
                Response.ContentType = "text/xml";

            return PartialView(MVC.Identity.Views._SamlMetadata, model);
        }
    }
}
