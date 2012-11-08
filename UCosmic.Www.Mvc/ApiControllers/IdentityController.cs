using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Security;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class IdentityController : ApiController
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

        [POST("sign-in")]
        public HttpResponseMessage SignIn(SignInApiModel model)
        {
            if (!_passwords.Validate(model.UserName, model.Password))
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest);
                return badRequest;
            }

            var authCookie = FormsAuthentication.GetAuthCookie(model.UserName,
                true /* web api cookie must be persistent to appear in document.cookies */);

            var cookieHeader = new CookieHeaderValue(FormsAuthentication.FormsCookieName, authCookie.Value)
            {
                Expires = authCookie.Expires,
                Domain = authCookie.Domain,
                Path = authCookie.Path,
            };

            var response = new HttpResponseMessage();
            response.Headers.AddCookies(new[] { cookieHeader });
            return response;
        }

        [GET("sign-out")]
        public HttpResponseMessage GetSignOut()
        {
            var resp = new HttpResponseMessage();

            var cookie = new CookieHeaderValue(FormsAuthentication.FormsCookieName, "NoCookie")
            {
                Expires = new DateTime(1999, 10, 12),
            };

            resp.Headers.AddCookies(new[] { cookie });

            _userSigner.SignOff();
            return resp;
        }
    }
}
