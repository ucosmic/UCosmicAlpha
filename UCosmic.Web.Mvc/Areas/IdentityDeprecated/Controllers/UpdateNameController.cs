using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Areas.IdentityDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.IdentityDeprecated.Controllers
{
    public class UpdateNameServices
    {
        public UpdateNameServices(
            IProcessQueries queryProcessor
            , IHandleCommands<UpdateMyName> commandHandler
        )
        {
            QueryProcessor = queryProcessor;
            CommandHandler = commandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public IHandleCommands<UpdateMyName> CommandHandler { get; private set; }
    }

    [Authorize]
    public partial class UpdateNameController : Controller
    {
        private readonly UpdateNameServices _services;

        public UpdateNameController(UpdateNameServices services)
        {
            _services = services;
        }

        [HttpGet]
        //[NullLayoutOnChildAction]
        //[ActionName("update-name")]
        //[OpenTopTab(TopTabName.Home)]
        public virtual ActionResult Get()
        {
            var user = _services.QueryProcessor.Execute(
                new UserByName(User.Identity.Name)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        u => u.Person.Emails,
                    }
                }
            );

            if (user == null) return HttpNotFound();

            var model = Mapper.Map<UpdateNameForm>(user.Person);

            if (ControllerContext.IsChildAction) return PartialView(MVC.IdentityDeprecated.Shared.Views.update_name, model);
            return View(MVC.IdentityDeprecated.Shared.Views.update_name, model);
        }

        [HttpPut]
        [UnitOfWork]
        //[OpenTopTab(TopTabName.Home)]
        //[ActionName("update-name")]
        public virtual ActionResult Put(UpdateNameForm model)
        {
            // make sure model is not null
            if (model == null) return HttpNotFound();

            // make sure model state is valid
            if (!ModelState.IsValid) return View(MVC.IdentityDeprecated.Shared.Views.update_name, model);

            // execute command, set feedback message, and redirect
            var command = Mapper.Map<UpdateMyName>(model);
            command.Principal = User;
            _services.CommandHandler.Handle(command);
            //SetFeedbackMessage(command.ChangedState
            //    ? SuccessMessage
            //    : NoChangesMessage
            //);
            return Redirect(UpdateNameForm.ReturnUrl);
        }

        public const string SuccessMessage = "Your info was successfully updated.";
        public const string NoChangesMessage = "No changes were made.";
    }

    //public static class UpdateNameRouter
    //{
    //    private static readonly string Area = MVC.Identity.Name;
    //    private static readonly string Controller = MVC.Identity.UpdateName.Name;

    //    public class GetRoute : MvcRoute
    //    {
    //        public GetRoute()
    //        {
    //            Url = "my/name/edit";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateName.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }

    //    public class PutRoute : MvcRoute
    //    {
    //        public PutRoute()
    //        {
    //            Url = "my/name";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateName.ActionNames.Put,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("POST", "PUT"),
    //            });
    //        }
    //    }
    //}
}
