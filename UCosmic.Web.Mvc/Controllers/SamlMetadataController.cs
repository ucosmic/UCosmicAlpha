using System;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Saml;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class SamlMetadataController : Controller
    {
        private readonly IManageConfigurations _configurationManager;
        private readonly IStoreSamlCertificates _samlCertificates;

        public SamlMetadataController(IStoreSamlCertificates samlCertificates
            , IManageConfigurations configurationManager
        )
        {
            _configurationManager = configurationManager;
            _samlCertificates = samlCertificates;
        }

        [GET("sign-on/saml/2/metadata")]
        [NonHtmlOutputCache(Duration = 60 * 60 * 24 * 7 * 30, VaryByParam = "*")]
        public virtual PartialViewResult RealSamlMetadata(string contentType = null)
        {
            return Get(contentType);
        }

        [GET("sign-on/saml/2/metadata/develop")]
        [NonHtmlOutputCache(Duration = 60 * 60 * 24 * 7 * 30, VaryByParam = "*")]
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

            return PartialView(MVC.SamlMetadata.Views._EntityDescriptorXml, model);
        }
    }
}
