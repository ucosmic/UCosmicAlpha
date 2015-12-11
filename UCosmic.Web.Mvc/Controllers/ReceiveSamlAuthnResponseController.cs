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
using System.Text;
using System.Xml;


namespace UCosmic.Web.Mvc.Controllers

{

    
    public class ReceiveSamlAuthnResponseServices
    {
        public ReceiveSamlAuthnResponseServices(IProcessQueries queryProcessor
            , ISignUsers userSigner
            , IProvideSaml2Service samlServiceProvider
            , IHandleCommands<ReceiveSamlAuthnResponseCommand> commandHandler
        )
        {
            QueryProcessor = queryProcessor;
            UserSigner = userSigner;
            SamlServiceProvider = samlServiceProvider;
            CommandHandler = commandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public ISignUsers UserSigner { get; private set; }
        public IProvideSaml2Service SamlServiceProvider { get; private set; }
        public IHandleCommands<ReceiveSamlAuthnResponseCommand> CommandHandler { get; private set; }
    }
    public partial class ReceiveSamlAuthnResponseController : Controller
    {
        private readonly ReceiveSamlAuthnResponseServices _services;

        //public extern HttpContextBase HttpContext { get; }
        public ReceiveSamlAuthnResponseController(ReceiveSamlAuthnResponseServices services)
        {
            _services = services;
        }

        [POST("sign-on/saml/2/post")]
        [ValidateInput(false)]
        public virtual ActionResult Post()
        {

            var date = DateTime.Now;
            Run_Firebase_test(date.ToString(), "response_time_1");
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            //SAMLProcessor samlResponse = new SAMLProcessor(Request["SAMLResponse"]);

            string rawSamlData = Request["SAMLResponse"];

            //// the sample data sent us may be already encoded, 
            //// which results in double encoding
            if (rawSamlData.Contains('%'))
            {
                rawSamlData = HttpUtility.UrlDecode(rawSamlData);
            }

            // read the base64 encoded bytes
            byte[] samlData = Convert.FromBase64String(rawSamlData);

            // read back into a UTF string
            string samlAssertion = Encoding.UTF8.GetString(samlData);
            Run_Firebase_test("isPost", "response_1");
            Run_Firebase_test(rawSamlData, "response_2");
            Run_Firebase_test(samlData, "response_3");
            Run_Firebase_test(samlAssertion, "response_4");


            //Run_Firebase_test(samlResponse, 1);
            //Run_Firebase_test(HttpContext.Request.Form, 2);
            //Run_Firebase_test(HttpContext.Request.Form[0], 7);
            //Run_Firebase_test(Saml2SsoBinding.HttpPost, 3);
            //Run_Firebase_test(samlResponse.IssuerNameIdentifier, 4);
            //Run_Firebase_test(HttpContext.Request, 5);
            //Run_Firebase_test(HttpContext.Response, 6);
            _services.CommandHandler.Handle(
                new ReceiveSamlAuthnResponseCommand
                {
                    SamlResponse = samlResponse,
                }
            );

            var establishment = _services.QueryProcessor.Execute(
                new EstablishmentBySamlEntityId
                {
                    SamlEntityId = samlResponse.IssuerNameIdentifier,
                }
            );

            //Run_Firebase_test("https://alpha-staging.ucosmic.com/", "response_5");

            //return Redirect("https://alpha.ucosmic.com/");
            Run_Firebase_test(samlResponse.RelayResourceUrl, "samlResponse.RelayResourceUrl");
            var returnUrl = samlResponse.RelayResourceUrl ??
                            _services.UserSigner.DefaultSignedOnUrl;
            if (returnUrl == "https://alpha.ucosmic.com/sign-on/saml/2/post")
            {
                returnUrl = "/person/";
            }

            Run_Firebase_test(returnUrl, "response_5");
            Run_Firebase_test(date.ToString(), "response_time_2");
            return
                Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
                    Server.UrlEncode(returnUrl)));
            //return Redirect(returnUrl);
        }
        [POST("sign-on/saml/22")]
        [ValidateInput(false)]
        public virtual ActionResult Post2()
        {
            // use HttpContext to create a SamlResponse
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            //SAMLProcessor samlResponse = new SAMLProcessor(Request["SAMLResponse"]);


            // execute command on the saml response object
            Run_Firebase_test(HttpContext.Response, "response_444");
            _services.CommandHandler.Handle(
                new ReceiveSamlAuthnResponseCommand
                {
                    SamlResponse = samlResponse,
                }
            );

            Run_Firebase_test(HttpContext.Response, "response_1813");
            // flash the success message

            // redirect after sign on
            var establishment = _services.QueryProcessor.Execute(
                new EstablishmentBySamlEntityId
                {
                    SamlEntityId = samlResponse.IssuerNameIdentifier,
                }
            );

            //var returnUrl = samlResponse.RelayResourceUrl ??
            //                _services.UserSigner.DefaultSignedOnUrl;

            //if (Request.Url != null)
            //{
            //    if (Request.Url.Host == "preview.ucosmic.com" && returnUrl.StartsWith("https://alpha.ucosmic.com"))
            //    {
            //        return
            //            Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
            //                Server.UrlEncode(returnUrl)));
            //    }
            //}

            //return Redirect("https://alpha.ucosmic.com/");
            var returnUrl = samlResponse.RelayResourceUrl ??
                            _services.UserSigner.DefaultSignedOnUrl;

            return
                Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
                    Server.UrlEncode(returnUrl)));
            //return Redirect(returnUrl);
        }

        [POST("sign-on/saml/2/post")]
        public virtual ActionResult PostPost()
        {
            // use HttpContext to create a SamlResponse
            //var samlResponse = _services.SamlServiceProvider
            //    .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            //SAMLProcessor samlResponse = new SAMLProcessor(Request["SAMLResponse"]);
            

            string rawSamlData = Request["SAMLResponse"];

            // the sample data sent us may be already encoded, 
            // which results in double encoding
            if (rawSamlData.Contains('%'))
            {
                rawSamlData = HttpUtility.UrlDecode(rawSamlData);
            }

            // read the base64 encoded bytes
            byte[] samlData = Convert.FromBase64String(rawSamlData);

            // read back into a UTF string
            string samlAssertion = Encoding.UTF8.GetString(samlData);
            Run_Firebase_test("isPostPost", "response_1");
            Run_Firebase_test(rawSamlData, "response_2");
            Run_Firebase_test(samlData, "response_3");
            Run_Firebase_test(samlAssertion, "response_4");
            //Run_Firebase_test(rawSamlData, "response_1");


            //Run_Firebase_test(samlResponse, 1);
            //Run_Firebase_test(HttpContext.Request.Form, 2);
            //Run_Firebase_test(HttpContext.Request.Form[0], 7);
            //Run_Firebase_test(Saml2SsoBinding.HttpPost, 3);
            //Run_Firebase_test(samlResponse.IssuerNameIdentifier, 4);
            //Run_Firebase_test(HttpContext.Request, 5);
            //Run_Firebase_test(HttpContext.Response, 6);
            // execute command on the saml response object
            _services.CommandHandler.Handle(
                new ReceiveSamlAuthnResponseCommand
                {
                    SamlResponse = samlResponse,
                }
            );

            // flash the success message

            // redirect after sign on
            var establishment = _services.QueryProcessor.Execute(
                new EstablishmentBySamlEntityId
                {
                    SamlEntityId = samlResponse.IssuerNameIdentifier,
                }
            );

            //var returnUrl = samlResponse.RelayResourceUrl ??
            //                _services.UserSigner.DefaultSignedOnUrl;

            //if (Request.Url != null)
            //{
            //    if (Request.Url.Host == "preview.ucosmic.com" && returnUrl.StartsWith("https://alpha.ucosmic.com"))
            //    {
            //        return
            //            Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
            //                Server.UrlEncode(returnUrl)));
            //    }
            //}

            //return Redirect("https://alpha.ucosmic.com/");
            var returnUrl = samlResponse.RelayResourceUrl ??
                            _services.UserSigner.DefaultSignedOnUrl;


            //return Redirect(returnUrl);
            return
                Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
                    Server.UrlEncode(returnUrl)));
        }
        [GET("sign-on/saml/2")]
        public virtual ActionResult Get()
        {
            // use HttpContext to create a SamlResponse
            //var samlResponse = _services.SamlServiceProvider
            //    .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            //SAMLProcessor samlResponse = new SAMLProcessor(Request["SAMLResponse"]);


            string rawSamlData = Request["SAMLResponse"];

            // the sample data sent us may be already encoded, 
            // which results in double encoding
            if (rawSamlData.Contains('%'))
            {
                rawSamlData = HttpUtility.UrlDecode(rawSamlData);
            }

            // read the base64 encoded bytes
            byte[] samlData = Convert.FromBase64String(rawSamlData);

            // read back into a UTF string
            string samlAssertion = Encoding.UTF8.GetString(samlData);
            Run_Firebase_test("isGet", "response_1");
            Run_Firebase_test(rawSamlData, "response_2");
            Run_Firebase_test(samlData, "response_3");
            Run_Firebase_test(samlAssertion, "response_4");
            // execute command on the saml response object
            _services.CommandHandler.Handle(
                new ReceiveSamlAuthnResponseCommand
                {
                    SamlResponse = samlResponse,
                }
            );


            // redirect after sign on
            var establishment = _services.QueryProcessor.Execute(
                new EstablishmentBySamlEntityId
                {
                    SamlEntityId = samlResponse.IssuerNameIdentifier,
                }
            );

            //return Redirect("https://alpha.ucosmic.com/");
            var returnUrl = samlResponse.RelayResourceUrl ??
                            _services.UserSigner.DefaultSignedOnUrl;


            //return Redirect(returnUrl);
            return
                Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
                    Server.UrlEncode(returnUrl)));
        }
        [GET("sign-on/saml/2/post")]
        public virtual ActionResult GetPost()
        {
            // use HttpContext to create a SamlResponse
            //var samlResponse = _services.SamlServiceProvider
            //    .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            //SAMLProcessor samlResponse = new SAMLProcessor(Request["SAMLResponse"]);


            string rawSamlData = Request["SAMLResponse"];

            // the sample data sent us may be already encoded, 
            // which results in double encoding
            if (rawSamlData.Contains('%'))
            {
                rawSamlData = HttpUtility.UrlDecode(rawSamlData);
            }

            // read the base64 encoded bytes
            byte[] samlData = Convert.FromBase64String(rawSamlData);

            // read back into a UTF string
            string samlAssertion = Encoding.UTF8.GetString(samlData);
            Run_Firebase_test("isGetPost", "response_1");
            Run_Firebase_test(rawSamlData, "response_2");
            Run_Firebase_test(samlData, "response_3");
            Run_Firebase_test(samlAssertion, "response_4");
            // execute command on the saml response object
            _services.CommandHandler.Handle(
                new ReceiveSamlAuthnResponseCommand
                {
                    SamlResponse = samlResponse,
                }
            );


            var establishment = _services.QueryProcessor.Execute(
                new EstablishmentBySamlEntityId
                {
                    SamlEntityId = samlResponse.IssuerNameIdentifier,
                }
            );

            // redirect after sign on
            var returnUrl = samlResponse.RelayResourceUrl ??
                            _services.UserSigner.DefaultSignedOnUrl;


            //return Redirect(returnUrl);
            return
                Redirect(string.Format("https://alpha.ucosmic.com/sign-in/tenantize/?returnUrl={0}",
                    Server.UrlEncode(returnUrl)));
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
    }

    //public static class ReceiveSamlAuthnResponseRouter
    //{
    //    private static readonly string Area = MVC.Identity.Name;
    //    private static readonly string Controller = MVC.Identity.ReceiveSamlAuthnResponse.Name;

    //    public class PostRoute : MvcRoute
    //    {
    //        public PostRoute()
    //        {
    //            Url = "sign-on/saml/2/post";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.ReceiveSamlAuthnResponse.ActionNames.Post,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("POST"),
    //            });
    //        }
    //    }
    //}
}
