using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;

namespace UCosmic.Web.Mvc.ApiControllers
{
    public class PersonUrlsController : ApiController
    {
        [GET("people/{personId:int}/urls")]
        public HttpResponseMessage GetSingle(int personId)
        {
            return null;
        }

        [POST("people/{personId:int}/urls")]
        public HttpResponseMessage Post(int personId)
        {
            return null;
        }

        [PUT("people/{personId:int}/urls/{urlId:int}")]
        public HttpResponseMessage Put(int personId, int urlId)
        {
            return null;
        }

        [DELETE("people/{personId:int}/urls/{urlId:int}")]
        public HttpResponseMessage Delete(int personId, int urlId)
        {
            return null;
        }
    }
}
