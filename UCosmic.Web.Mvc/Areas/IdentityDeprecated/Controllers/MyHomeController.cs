using System;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Areas.IdentityDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.IdentityDeprecated.Controllers
{
    [Authorize]
    [RouteArea("IdentityDeprecated")]
    public partial class MyHomeController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public MyHomeController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [HttpGet]
        [GET("dv/my/home", IsAbsoluteUrl = true)]
        //[ActionName("my-home")]
        //[OpenTopTab(TopTabName.Home)]
        public virtual ActionResult Get()
        {
            var user = _queryProcessor.Execute(
                new UserByName(User.Identity.Name)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        u => u.Person.Emails,
                        u => u.Person.Affiliations.Select(a => a.Establishment),
                    }
                }
            );

            if (user == null) return HttpNotFound();
            return View(MVC.IdentityDeprecated.Shared.Views.my_home, Mapper.Map<MyHomeInfo>(user.Person));
        }
    }

    //public static class MyHomeRouter
    //{
    //    private static readonly string Area = MVC.Identity.Name;
    //    private static readonly string Controller = MVC.Identity.MyHome.Name;

    //    public class GetRoute : MvcRoute
    //    {
    //        public const string UrlConstant = "my/home";

    //        public GetRoute()
    //        {
    //            Url = UrlConstant;
    //            AlternateUrls = new[] {"my"};
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.MyHome.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }
    //}
}
