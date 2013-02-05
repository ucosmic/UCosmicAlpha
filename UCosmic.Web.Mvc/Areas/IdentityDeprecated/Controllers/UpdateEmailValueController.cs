using System;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Areas.IdentityDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.IdentityDeprecated.Controllers
{
    public class UpdateEmailValueServices
    {
        public UpdateEmailValueServices(
            IProcessQueries queryProcessor
            , IHandleCommands<UpdateMyEmailValue> commandHandler
        )
        {
            QueryProcessor = queryProcessor;
            CommandHandler = commandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public IHandleCommands<UpdateMyEmailValue> CommandHandler { get; private set; }
    }

    //[Authenticate]
    public partial class UpdateEmailValueController : Controller
    {
        private readonly UpdateEmailValueServices _services;

        public UpdateEmailValueController(UpdateEmailValueServices services)
        {
            _services = services;
        }

        [HttpGet]
        //[OpenTopTab(TopTabName.Home)]
        //[ActionName("update-email-value")]
        [ReturnUrlReferrer("dv/my/home")]
        public virtual ActionResult Get(int number)
        {
            // get the email address
            var email = _services.QueryProcessor.Execute(
                new MyEmailAddressByNumber(User, number));

            if (email == null) return HttpNotFound();
            return View(MVC.IdentityDeprecated.Shared.Views.update_email_value, Mapper.Map<UpdateEmailValueForm>(email));
        }

        [HttpPut]
        [UnitOfWork]
        //[OpenTopTab(TopTabName.Home)]
        //[ActionName("update-email-value")]
        public virtual ActionResult Put(UpdateEmailValueForm model)
        {
            // make sure user owns this email address
            if (model == null || !User.Identity.Name.Equals(model.PersonUserName, StringComparison.OrdinalIgnoreCase))
                return HttpNotFound();

            // make sure model state is valid
            if (!ModelState.IsValid) return View(MVC.IdentityDeprecated.Shared.Views.update_affiliation, model);

            // execute command, set feedback message, and redirect
            var command = Mapper.Map<UpdateMyEmailValue>(model);
            command.Principal = User;
            _services.CommandHandler.Handle(command);
            //SetFeedbackMessage(command.ChangedState
            //    ? string.Format(SuccessMessageFormat, model.Value)
            //    : NoChangesMessage
            //);
            return Redirect(model.ReturnUrl);
        }

        public const string SuccessMessageFormat = "Your email address was successfully changed to {0}.";
        public const string NoChangesMessage = "No changes were made.";

        //[HttpPost]
        //[OutputCache(VaryByParam = "*", VaryByCustom = VaryByCustomUser, Duration = 1800)]
        //public virtual JsonResult ValidateValue(
        //    [CustomizeValidator(Properties = UpdateEmailValueForm.ValuePropertyName)] UpdateEmailValueForm model)
        //{
        //    return ValidateRemote(UpdateEmailValueForm.ValuePropertyName);
        //}
    }

    //public static class UpdateEmailValueRouter
    //{
    //    private static readonly string Area = MVC.Identity.Name;
    //    private static readonly string Controller = MVC.Identity.UpdateEmailValue.Name;

    //    public class GetRoute : MvcRoute
    //    {
    //        public GetRoute()
    //        {
    //            Url = "my/emails/{number}/change-spelling";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateEmailValue.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class PutRoute : MvcRoute
    //    {
    //        public PutRoute()
    //        {
    //            Url = "my/emails/{number}";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateEmailValue.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("POST", "PUT"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class ValidateValueRoute : MvcRoute
    //    {
    //        public ValidateValueRoute()
    //        {
    //            Url = "my/emails/{number}/change-spelling/validate";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateEmailValue.ActionNames.ValidateValue,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("POST"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }
    //}
}
