using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.GeographicExpertise
{
    public class UpdateGeographicExpertiseLocation
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; set; }
        public int PlaceId { get; set; }
        public DateTime UpdatedOn { get; set; }
        public bool NoCommit { get; set; }

        public UpdateGeographicExpertiseLocation()
        {
        }

        public UpdateGeographicExpertiseLocation(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateGeographicExpertiseLocationCommand : AbstractValidator<UpdateGeographicExpertiseLocation>
    {
        public ValidateUpdateGeographicExpertiseLocationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnGeographicExpertiseLocation(entities, x => x.Id)
                .WithMessage(MustOwnGeographicExpertiseLocation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "GeographicExpertiseLocation id", x => x.Id)

                // id must exist in the database
                .MustFindGeographicExpertiseLocationById(entities)
                .WithMessage(MustFindGeographicExpertiseLocationById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyGeographicExpertiseLocationCommand : IHandleCommands<UpdateGeographicExpertiseLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;


        public HandleUpdateMyGeographicExpertiseLocationCommand(ICommandEntities entities,
                                                                IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateGeographicExpertiseLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the degree to update. */
            var target = _entities.Get<GeographicExpertiseLocation>().Single(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("GeographicExpertiseLocation Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            var updateExpertise = new GeographicExpertiseLocation
            {
                PlaceId = command.PlaceId,
            };

            if (target.Equals(updateExpertise))
            {
                return;
            }

            /* Update fields */
            target.PlaceId = command.PlaceId;       
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
