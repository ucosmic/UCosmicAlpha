using System;
using Pluralize;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentDepartment
    {
        public Establishment Establishment { get; set; }
        public EstablishmentCollege College { get; set; }
        public string Name { get; set; }
        public EstablishmentDepartment Created { get; set; }
    }

    public class HandleCreateEstablishmentDepartmentCommand : IHandleCommands<CreateEstablishmentDepartment>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEstablishmentDepartmentCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEstablishmentDepartment command)
        {
            if (command == null) throw new ArgumentNullException("command");
            if (string.IsNullOrWhiteSpace(command.Name)) throw new Exception("Name cannot be null or empty");

            var entity = new EstablishmentDepartment
            {
              Name = command.Name
            };

            _entities.Create(entity);

            command.Created = entity;
        }
    }
}
