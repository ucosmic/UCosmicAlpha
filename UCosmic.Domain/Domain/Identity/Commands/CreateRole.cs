using System;

namespace UCosmic.Domain.Identity
{
    public class CreateRole
    {
        public CreateRole(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be null or white space.", "name");
            Name = name;
        }

        public string Name { get; private set; }
        public string Description { get; set; }
    }

    public class HandleCreateRoleCommand : IHandleCommands<CreateRole>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateRoleCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateRole command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new Role
            {
                Name = command.Name,
                Description = command.Description,
            };

            _entities.Create(entity);
        }
    }
}
