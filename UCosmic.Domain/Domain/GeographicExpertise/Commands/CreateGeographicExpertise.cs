using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.GeographicExpertises
{
    public class CreateGeographicExpertise
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }
        public int PlaceId { get; protected set; }
        public string Description { get; set; }
        public bool NoCommit { get; set; }
        public GeographicExpertise CreatedGeographicExpertise { get; protected internal set; }

        public CreateGeographicExpertise(IPrincipal principal, int placeId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (placeId == 0) throw new ArgumentNullException("placeId");
            Principal = principal;
            PlaceId = placeId;
        }
    }

    public class ValidateCreateGeographicExpertiseCommand : AbstractValidator<CreateGeographicExpertise>
    {
        public ValidateCreateGeographicExpertiseCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateGeographicExpertiseCommand : IHandleCommands<CreateGeographicExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateGeographicExpertiseCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateGeographicExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            var expertise = new GeographicExpertise
            {
                PersonId = person.RevisionId,
                PlaceId = command.PlaceId,
                Description = command.Description,
                
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                expertise.EntityId = command.EntityId.Value;
            }

            _entities.Create(expertise);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedGeographicExpertise = expertise;
        }
    }
}
