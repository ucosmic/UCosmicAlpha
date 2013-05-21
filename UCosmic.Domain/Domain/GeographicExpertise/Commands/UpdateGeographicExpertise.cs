using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.GeographicExpertises
{
    public class UpdateGeographicExpertise
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; protected set; }
        public ICollection<GeographicExpertiseLocation> Locations { get; set; }
        public string Description { get; set; }
        public DateTime UpdatedOn { get; set; }
        public bool NoCommit { get; set; }

        public UpdateGeographicExpertise()
        {
        }

        public UpdateGeographicExpertise(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateGeographicExpertiseCommand : AbstractValidator<UpdateGeographicExpertise>
    {
        public ValidateUpdateGeographicExpertiseCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnGeographicExpertise(entities, x => x.Id)
                .WithMessage(MustOwnGeographicExpertise<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "GeographicExpertise id", x => x.Id)

                // id must exist in the database
                .MustFindGeographicExpertiseById(entities)
                .WithMessage(MustFindGeographicExpertiseById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyGeographicExpertiseCommand : IHandleCommands<UpdateGeographicExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateGeographicExpertiseLocation> _createGeographicExpertiseLocation;
        private readonly IHandleCommands<DeleteGeographicExpertiseLocation> _deleteGeographicExpertiseLocation;


        public HandleUpdateMyGeographicExpertiseCommand(ICommandEntities entities,
                                                        IUnitOfWork unitOfWork,
                                                        IHandleCommands<CreateGeographicExpertiseLocation> createGeographicExpertiseLocation,
                                                        IHandleCommands<DeleteGeographicExpertiseLocation> deleteGeographicExpertiseLocation
                                                        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createGeographicExpertiseLocation = createGeographicExpertiseLocation;
            _deleteGeographicExpertiseLocation = deleteGeographicExpertiseLocation;
        }

        public void Handle(UpdateGeographicExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the expertise to update. */
            var target = _entities.Get<GeographicExpertise>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("GeographicExpertise Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            /* Retrieve the expertise locations to update. */
            var targetLocations = _entities.Get<GeographicExpertiseLocation>().Where(a => a.ExpertiseId == target.RevisionId).ToArray();

            /* If target fields equal new field values, we do not proceed. */
            if ((target.Description == command.Description) &&
                targetLocations.SequenceEqual(command.Locations))
            {
                return;
            }

            /* Run through all new locations and attempt to find same in target.  If not found, create.*/
            foreach (var location in command.Locations.ToList())
            {
                var targetLocation = target.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (targetLocation == null)
                {
                    var createGeographicExpertiseLocation = new CreateGeographicExpertiseLocation(
                        command.Principal, target.RevisionId,location.PlaceId)
                    {
                        NoCommit = true
                    };

                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocation);
                }
            }

            /* Delete activity locations. Run through the targets list of locations and try to find
                a matching one in the updated list.  If not found, it must have been deleted. */
            foreach (var location in target.Locations.ToList())
            {
                var updateLocation = command.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (updateLocation == null)
                {
                    var deleteGeographicExpertiseLocationCommand = new DeleteGeographicExpertiseLocation(
                        command.Principal, location.RevisionId)
                    {
                        NoCommit = true
                    };

                    _deleteGeographicExpertiseLocation.Handle(deleteGeographicExpertiseLocationCommand);
                }
            }

            /* Update fields */
            target.Description = command.Description;          
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
