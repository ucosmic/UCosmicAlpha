using System.Net.Http.Headers;

namespace UCosmic.Web.Mvc
{
    public class ImageMediaFormatter : FileMediaFormatter
    {
        public ImageMediaFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/png"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/gif"));

            // IE8 sometimes uses these mime types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/pjpeg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/x-png"));
        }
    }
}