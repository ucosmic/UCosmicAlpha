using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Files;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/uploads")]
    [TryAuthorize(Roles = RoleName.AgreementManagers)]
    public class UploadsController : ApiController
    {
        private readonly IHandleCommands<CreateLooseFile> _createFile;
        private readonly IHandleCommands<PurgeLooseFile> _purgeFile;

        public UploadsController(IHandleCommands<CreateLooseFile> createFile
            , IHandleCommands<PurgeLooseFile> purgeFile
        )
        {
            _createFile = createFile;
            _purgeFile = purgeFile;
        }

        [POST("")]
        public HttpResponseMessage Post(FileMedia file)
        {
            if (file == null || file.Content == null || file.Content.Length < 1
                || string.IsNullOrWhiteSpace(file.ContentType) || string.IsNullOrWhiteSpace(file.FileName))
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            var command = Mapper.Map<CreateLooseFile>(file);
            _createFile.Handle(command);

            // only return the guid
            return Request.CreateResponse(HttpStatusCode.Created, command.Created.EntityId.ToString());
        }

        [DELETE("{fileGuid:guid}")]
        public HttpResponseMessage Delete(Guid fileGuid)
        {
            _purgeFile.Handle(new PurgeLooseFile(fileGuid));
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
