// <auto-generated />
// This file was generated by a T4 template.
// Don't change it directly as your change would get overwritten.  Instead, make changes
// to the .tt file (i.e. the T4 template) and save it to regenerate this file.

// Make sure the compiler doesn't complain about missing Xml comments
#pragma warning disable 1591
#region T4MVC

using System;
using System.Diagnostics;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Web.Mvc.Html;
using System.Web.Routing;
using T4MVC;
namespace UCosmic.Www.Mvc.Controllers {
    public partial class EstablishmentsController {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public EstablishmentsController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected EstablishmentsController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ViewResult Show() {
            return new T4MVC_ViewResult(Area, Name, ActionNames.Show);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public EstablishmentsController Actions { get { return MVC.Establishments; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Establishments";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Establishments";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass {
            public readonly string Index = "Index";
            public readonly string New = "New";
            public readonly string Show = "Show";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants {
            public const string Index = "Index";
            public const string New = "New";
            public const string Show = "Show";
        }


        static readonly ActionParamsClass_Show s_params_Show = new ActionParamsClass_Show();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Show ShowParams { get { return s_params_Show; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Show {
            public readonly string id = "id";
        }
        static readonly ViewNames s_views = new ViewNames();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewNames Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewNames {
            public readonly string _FormAndCards = "~/Views/Establishments/_FormAndCards.cshtml";
            public readonly string _FormSideBar = "~/Views/Establishments/_FormSideBar.cshtml";
            public readonly string _SearchAndResults = "~/Views/Establishments/_SearchAndResults.cshtml";
            public readonly string _SearchSideBar = "~/Views/Establishments/_SearchSideBar.cshtml";
            public readonly string Index = "~/Views/Establishments/Index.cshtml";
            public readonly string New = "~/Views/Establishments/New.cshtml";
            public readonly string Show = "~/Views/Establishments/Show.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class T4MVC_EstablishmentsController: UCosmic.Www.Mvc.Controllers.EstablishmentsController {
        public T4MVC_EstablishmentsController() : base(Dummy.Instance) { }

        public override System.Web.Mvc.ViewResult Index() {
            var callInfo = new T4MVC_ViewResult(Area, Name, ActionNames.Index);
            return callInfo;
        }

        public override System.Web.Mvc.ViewResult New() {
            var callInfo = new T4MVC_ViewResult(Area, Name, ActionNames.New);
            return callInfo;
        }

        public override System.Web.Mvc.ViewResult Show(int id) {
            var callInfo = new T4MVC_ViewResult(Area, Name, ActionNames.Show);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
