using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class CreateLooseFile
    {
        public byte[] Content { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }
        public LooseFile CreatedLooseFile { get; internal set; }
    }

    public class HandleCreateLooseFileCommand : IHandleCommands<CreateLooseFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateLooseFileCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateLooseFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new LooseFile
            {
                Content = command.Content,
                Length = command.Content.Length,
                MimeType = command.MimeType,
                Name = command.Name,
            };

            _entities.Create(entity);
            _unitOfWork.SaveChanges();
            command.CreatedLooseFile = _entities.Query<LooseFile>()
                .SingleOrDefault(x => x.EntityId == entity.EntityId);
        }
    }
}
