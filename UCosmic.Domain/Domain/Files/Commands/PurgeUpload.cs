using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class PurgeUpload
    {
        public PurgeUpload(Guid guid)
        {
            if (guid == Guid.Empty) throw new ArgumentException("Cannot be empty.", "guid");
            Guid = guid;
        }

        public Guid Guid { get; private set; }
    }

    public class HandlePurgeUploadCommand : IHandleCommands<PurgeUpload>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeUploadCommand(ICommandEntities entities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(PurgeUpload command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<Upload>()
                .SingleOrDefault(x => command.Guid.Equals(x.Guid));
            if (entity == null) return;

            _binaryData.Delete(entity.Path);
            _entities.Purge(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
