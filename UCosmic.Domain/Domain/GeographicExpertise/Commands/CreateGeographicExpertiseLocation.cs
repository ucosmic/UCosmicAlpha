using System;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.GeographicExpertises
{
    public class CreateGeographicExpertiseLocation
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }
        public int ExpertiseId { get; protected set; }
        public int PlaceId { get; protected set; }
        public bool NoCommit { get; set; }
        public GeographicExpertiseLocation CreatedGeographicExpertiseLocation { get; protected internal set; }

        public CreateGeographicExpertiseLocation(IPrincipal principal, int expertiseId, int placeId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (expertiseId == 0) throw new ArgumentNullException("expertiseId");
            if (placeId == 0) throw new ArgumentNullException("placeId");
            Principal = principal;
            ExpertiseId = expertiseId;
            PlaceId = placeId;
        }
    }

    public class ValidateCreateGeographicExpertiseLocationCommand : AbstractValidator<CreateGeographicExpertiseLocation>
    {
        public ValidateCreateGeographicExpertiseLocationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateGeographicExpertiseLocationCommand : IHandleCommands<CreateGeographicExpertiseLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateGeographicExpertiseLocationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateGeographicExpertiseLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var location = new GeographicExpertiseLocation
            {
                ExpertiseId = command.ExpertiseId,
                PlaceId = command.PlaceId,               
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                location.EntityId = command.EntityId.Value;
            }

            _entities.Create(location);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedGeographicExpertiseLocation = location;
        }
    }
}
