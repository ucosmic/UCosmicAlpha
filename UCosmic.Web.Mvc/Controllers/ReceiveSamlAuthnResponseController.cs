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


namespace UCosmic.Www.Mvc.Areas.Identity.Controllers
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

        [POST("sign-on/saml/2")]
        public virtual ActionResult Post()
        {
            // use HttpContext to create a SamlResponse
            var samlResponse = _services.SamlServiceProvider
                .ReceiveSamlResponse(Saml2SsoBinding.HttpPost, HttpContext);
            Run_Firebase_test(samlResponse, 1);
            Run_Firebase_test(HttpContext.Request.Form, 2);
            Run_Firebase_test(HttpContext.Request.Form[0], 7);
            Run_Firebase_test(HttpContext.Request.Headers, 3);
            Run_Firebase_test(HttpContext.Items, 4);
            Run_Firebase_test(HttpContext.Request, 5);
            Run_Firebase_test(HttpContext.Response, 6);
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

            return Redirect("https://alpha-staging.ucosmic.com/");
        }

        public async void Run_Firebase_test(Object saml_response, int test_number)//(CancellationToken cancellationToken)
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
