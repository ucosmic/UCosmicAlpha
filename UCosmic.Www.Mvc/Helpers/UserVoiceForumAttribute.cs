using System;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class UserVoiceForumAttribute : ActionFilterAttribute
    {
        public const string ForumId = "UserVoiceScript";
        public const string ForumHref = "UserVoiceHref";
        public const string DefaultForumId = "kKkVzX4Nj95jXT74LBo3VQ";
        public const string DefaultForumHref = "https://ucosmic.uservoice.com/forums/150533-general-feedback-support";

        public UserVoiceForumAttribute(UserVoiceForum forum)
        {
            Forum = forum;
        }

        public UserVoiceForum Forum { get; private set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            var viewData = filterContext.Controller.ViewData;

            switch (Forum)
            {
                case UserVoiceForum.InstitutionalAgreements:
                    viewData[ForumId] = "foaDhAccc9p9GWHsSl81dg";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/133860-institutional-agreements";
                    break;
                case UserVoiceForum.Employees:
                    viewData[ForumId] = "PhrFhNdbVBZ9V19hPg2w";
                    viewData[ForumHref] = "http://ucosmic.uservoice.com/forums/150532-faculty-staff";
                    break;
                case UserVoiceForum.Alumni:
                    viewData[ForumId] = "WtfS3tlQ2gVDkCKKPDPkQ";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150535-alumni";
                    break;
                case UserVoiceForum.Students:
                    viewData[ForumId] = "1ctpeEPPvhVh5y5NIbQ";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150536-students";
                    break;
                case UserVoiceForum.Representatives:
                    viewData[ForumId] = "ULe6KwpyqbIMj5HqPQWg";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150538-representatives";
                    break;
                case UserVoiceForum.Travel:
                    viewData[ForumId] = "TDVw1ZesXD3hLBUdmCPRSA";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150539-travel";
                    break;
                case UserVoiceForum.CorporateEngagement:
                    viewData[ForumId] = "glp1zwnv17VoHfrOD4gg";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150540-corporate-engagement";
                    break;
                case UserVoiceForum.GlobalPress:
                    viewData[ForumId] = "aGQxMkwUIfUlRfCLPTOx6A";
                    viewData[ForumHref] = "https://ucosmic.uservoice.com/forums/150541-global-press";
                    break;
                default:
                    viewData[ForumId] = DefaultForumId;
                    viewData[ForumHref] = DefaultForumHref;
                    break;
            }
        }
    }

    public enum UserVoiceForum
    {
        InstitutionalAgreements,
        Employees,
        Alumni,
        Students,
        Representatives,
        Travel,
        CorporateEngagement,
        GlobalPress,
    }
}