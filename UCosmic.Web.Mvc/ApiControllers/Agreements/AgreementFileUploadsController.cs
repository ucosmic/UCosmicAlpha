using System.Diagnostics;
using System.Web;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;
using Newtonsoft.Json;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements")]
    public class AgreementFileUploadsController : Controller
    {
        [POST("{agreementId:int}/files")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ContentResult PostFile(AgreementFileUploadModel model)
        {
            // return the same response that web api would
            var url = Url.HttpRouteUrl(null, new
            {
                controller = "AgreementFiles",
                action = "Get",
                model.AgreementId,
                fileId = 6,
            });
            Debug.Assert(url != null);
            Debug.Assert(Request.Url != null);
            url = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Host, url);
            var successPayload = new { message = string.Format("File '{0}' was successfully attached.", model.CustomName) };
            var successJson = JsonConvert.SerializeObject(successPayload);
            var result = Content(successJson, "text/plain");
            Response.StatusCode = 201;
            Response.Headers.Add("Location", url);
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Headers.Add("Pragma", "no-cache");
            Response.Charset = null;
            return result;
        }
    }
}