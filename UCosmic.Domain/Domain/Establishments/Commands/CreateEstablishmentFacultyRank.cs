using System;
using Pluralize;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentFacultyRank
    {
        public string Rank { get; set; }
        public EstablishmentFacultyRank Created { get; set; }
    }

    public class HandleCreateEstablishmentFacultyRankCommand : IHandleCommands<CreateEstablishmentFacultyRank>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEstablishmentFacultyRankCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEstablishmentFacultyRank command)
        {
            if (command == null) throw new ArgumentNullException("command");
            if (string.IsNullOrWhiteSpace(command.Rank)) throw new Exception("Rank cannot be null or empty");

            var entity = new EstablishmentFacultyRank
            {
              Rank = command.Rank
            };

            _entities.Create(entity);

            command.Created = entity;
        }
    }
}
