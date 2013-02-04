using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Areas.IdentityDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.IdentityDeprecated.Controllers
{
    public class UpdateAffiliationServices
    {
        public UpdateAffiliationServices(
            IProcessQueries queryProcessor
            , IHandleCommands<UpdateMyAffiliation> commandHandler
        )
        {
            QueryProcessor = queryProcessor;
            CommandHandler = commandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public IHandleCommands<UpdateMyAffiliation> CommandHandler { get; private set; }
    }

    [Authorize]
    public partial class UpdateAffiliationController : Controller
    {
        private readonly UpdateAffiliationServices _services;

        public UpdateAffiliationController(UpdateAffiliationServices services)
        {
            _services = services;
        }

        [HttpGet]
        //[OpenTopTab(TopTabName.Home)]
        [ActionName("update-affiliation")]
        //[ReturnUrlReferrer(MyHomeRouter.GetRoute.UrlConstant)]
        public virtual ActionResult Get(int establishmentId)
        {
            // get the affiliation
            var affiliation = _services.QueryProcessor.Execute(
                new MyAffiliationByEstablishmentId(User, establishmentId));

            if (affiliation == null) return HttpNotFound();
            return View(MVC.IdentityDeprecated.Shared.Views.update_affiliation,
                Mapper.Map<UpdateAffiliationForm>(affiliation));
        }

        [HttpPut]
        //[UnitOfWork]
        //[OpenTopTab(TopTabName.Home)]
        [ActionName("update-affiliation")]
        public virtual ActionResult Put(UpdateAffiliationForm model)
        {
            // make sure model is not null
            if (model == null) return HttpNotFound();

            // make sure model state is valid
            if (!ModelState.IsValid) return View(model);

            // execute command, set feedback message, and redirect
            var command = Mapper.Map<UpdateMyAffiliation>(model);
            command.Principal = User;
            _services.CommandHandler.Handle(command);
            //SetFeedbackMessage(command.ChangedState
            //    ? SuccessMessage
            //    : NoChangesMessage
            //);
            return Redirect(model.ReturnUrl);
        }

        public const string SuccessMessage = "Your affiliation info was successfully updated.";
        public const string NoChangesMessage = "No changes were made.";
    }

    //public static class UpdateAffiliationRouter
    //{
    //    private static readonly string Area = MVC.Identity.Name;
    //    private static readonly string Controller = MVC.Identity.UpdateAffiliation.Name;

    //    public class GetRoute : MvcRoute
    //    {
    //        public GetRoute()
    //        {
    //            Url = "my/affiliations/{establishmentId}/edit";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateAffiliation.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //                establishmentId = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class PutRoute : MvcRoute
    //    {
    //        public PutRoute()
    //        {
    //            Url = "my/affiliations/{establishmentId}";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Identity.UpdateAffiliation.ActionNames.Put,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("POST", "PUT"),
    //                establishmentId = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }
    //}
}
