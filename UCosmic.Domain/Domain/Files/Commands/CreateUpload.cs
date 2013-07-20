using System;
using System.Security.Principal;

namespace UCosmic.Domain.Files
{
    public class CreateUpload
    {
        public CreateUpload(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public byte[] Content { get; set; }
        public string FileName { get; set; }
        public string MimeType { get; set; }
        public Guid CreatedGuid { get; internal set; }
    }

    public class HandleCreateUploadCommand : IHandleCommands<CreateUpload>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateUploadCommand(ICommandEntities entities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateUpload command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new Upload
            {
                Length = command.Content.Length,
                MimeType = command.MimeType,
                FileName = command.FileName,
                CreatedByPrincipal = command.Principal.Identity.Name,
            };

            entity.Path = string.Format(Upload.PathFormat, entity.Guid);
            _binaryData.Put(entity.Path, command.Content);

            _entities.Create(entity);
            _unitOfWork.SaveChanges();
            command.CreatedGuid = entity.Guid;
        }
    }
}
