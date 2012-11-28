using System.Web;
using System.Web.Mvc;

namespace UCosmic.Www.Mvc.Models
{
    public class UserVoiceLinkModel
    {
        public UserVoiceLinkModel(HttpRequestBase request, ViewDataDictionary viewData)
        {
            Text = "Feedback & Support";

            // when user is signed on
            if (request.IsAuthenticated)
            {
                Href = "javascript:UserVoice.showPopupWidget();";
                Title = "Open feedback & support dialog (powered by UserVoice)";
            }

            // when user is anonymous
            else
            {
                Href = viewData[UserVoiceForumAttribute.ForumHref] as string ?? UserVoiceForumAttribute.DefaultForumHref;
                Target = "_blank";
            }
        }

        public string CssClass { get; set; }

        public string Text { get; set; }

        public string TextAfter { get; set; }

        public string Href { get; private set; }

        public string Title { get; private set; }

        public string Target { get; private set; }
    }
}