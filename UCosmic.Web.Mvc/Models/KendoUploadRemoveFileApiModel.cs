namespace UCosmic.Web.Mvc.Models
{
    public class KendoUploadRemoveFileApiModel
    {
        // for some reason, WebAPI doesn't like taking an action argument of (string fileNames).
        // to enable delete requests from kendo upload, use this as the action argument instead.
        public string[] FileNames { get; set; }
    }
}