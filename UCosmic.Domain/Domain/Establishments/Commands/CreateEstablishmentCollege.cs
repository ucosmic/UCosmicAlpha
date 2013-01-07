using System;
using Pluralize;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentCollege
    {
        public Establishment Establishment { get; set; }
        public string Name { get; set; }
        public EstablishmentCollege Created { get; set; }
    }

    public class HandleCreateEstablishmentCollegeCommand : IHandleCommands<CreateEstablishmentCollege>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEstablishmentCollegeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEstablishmentCollege command)
        {
            if (command == null) throw new ArgumentNullException("command");
            if (string.IsNullOrWhiteSpace(command.Name)) throw new Exception("Name cannot be null or empty");

            var entity = new EstablishmentCollege
            {
              Name = command.Name
            };

            _entities.Create(entity);

            command.Created = entity;
        }
    }
}
