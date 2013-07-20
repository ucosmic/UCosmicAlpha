using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using Newtonsoft.Json;
using UCosmic.Domain.Files;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/uploads")]
    [TryAuthorize(Roles = RoleName.AgreementManagers)]
    public class UploadsController : ApiController
    {
        private readonly IHandleCommands<CreateUpload> _createUpload;
        private readonly IHandleCommands<PurgeUpload> _purgeUpload;

        public UploadsController(IHandleCommands<CreateUpload> createUpload
            , IHandleCommands<PurgeUpload> purgeUpload
        )
        {
            _createUpload = createUpload;
            _purgeUpload = purgeUpload;
        }

        [POST("")]
        public HttpResponseMessage Post(FileMedium file)
        {
            if (file == null || file.Content == null || file.Content.Length < 1
                || string.IsNullOrWhiteSpace(file.ContentType) || string.IsNullOrWhiteSpace(file.FileName))
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            var command = new CreateUpload(User);
            Mapper.Map(file, command);
            _createUpload.Handle(command);

            // only return the guid
            var uploadId = command.CreatedGuid;
            var successPayload = new { guid = uploadId };
            var successJson = JsonConvert.SerializeObject(successPayload);
            return Request.CreateResponse(HttpStatusCode.Created, successJson, "text/plain");
        }

        [DELETE("{uploadId:guid}")]
        public HttpResponseMessage Delete(Guid uploadId)
        {
            _purgeUpload.Handle(new PurgeUpload(uploadId));
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
