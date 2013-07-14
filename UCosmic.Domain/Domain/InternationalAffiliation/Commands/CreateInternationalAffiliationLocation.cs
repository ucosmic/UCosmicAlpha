using System;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class CreateInternationalAffiliationLocation
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }
        public int AffiliationId { get; protected set; }
        public int PlaceId { get; protected set; }
        public bool NoCommit { get; set; }
        public InternationalAffiliationLocation CreatedInternationalAffiliationLocation { get; protected internal set; }

        public CreateInternationalAffiliationLocation(IPrincipal principal, int affiliationId, int placeId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (affiliationId == 0) throw new ArgumentNullException("affiliationId");
            if (placeId == 0) throw new ArgumentNullException("placeId");
            Principal = principal;
            AffiliationId = affiliationId;
            PlaceId = placeId;
        }
    }

    public class ValidateCreateAffiliationLocationCommand : AbstractValidator<CreateInternationalAffiliationLocation>
    {
        public ValidateCreateAffiliationLocationCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateAffiliationLocationCommand : IHandleCommands<CreateInternationalAffiliationLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateAffiliationLocationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateInternationalAffiliationLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var location = new InternationalAffiliationLocation
            {
                InternationalAffiliationId = command.AffiliationId,
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

            command.CreatedInternationalAffiliationLocation = location;
        }
    }
}
