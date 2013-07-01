using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class PurgeLooseFile
    {
        public PurgeLooseFile(Guid guid)
        {
            if (guid == Guid.Empty) throw new ArgumentException("Cannot be empty.", "guid");
            Guid = guid;
        }

        public Guid Guid { get; private set; }
    }

    public class HandlePurgeLooseFileCommand : IHandleCommands<PurgeLooseFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeLooseFileCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(PurgeLooseFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<LooseFile>().SingleOrDefault(x => command.Guid.Equals(x.EntityId));
            if (entity == null) return;

            _entities.Purge(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
