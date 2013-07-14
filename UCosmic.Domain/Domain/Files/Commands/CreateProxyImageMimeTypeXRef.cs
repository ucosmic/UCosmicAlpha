using System;

namespace UCosmic.Domain.Files
{
    public class CreateProxyImageMimeTypeXRef
    {
        public string MimeType { get; set; }
        public int ImageId { get; set; }

        public ProxyImageMimeTypeXRef CreatedProxyImageMimeTypeXRef { get; set; }
    }

    public class HandleCreateProxyImageMimeTypeXRefCommand : IHandleCommands<CreateProxyImageMimeTypeXRef>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateProxyImageMimeTypeXRefCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateProxyImageMimeTypeXRef command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var xref = new ProxyImageMimeTypeXRef
            {
                MimeType = command.MimeType,
                ImageId = command.ImageId
            };

            _entities.Create(xref);
            _unitOfWork.SaveChanges();

            command.CreatedProxyImageMimeTypeXRef = xref;
        }
    }
}
