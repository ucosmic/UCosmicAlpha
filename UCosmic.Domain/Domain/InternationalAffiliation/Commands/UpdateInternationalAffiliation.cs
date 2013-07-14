using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class UpdateInternationalAffiliation
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; protected set; }

        public DateTime From { get; set; }
        public DateTime? To { get; set; }
        public bool OnGoing { get; set; }
        public string Institution { get; set; }
        public string Position { get; set; }
        public ICollection<InternationalAffiliationLocation> Locations { get; set; }

        public DateTime UpdatedOn { get; set; }
        public bool NoCommit { get; set; }

        public UpdateInternationalAffiliation()
        {
        }

        public UpdateInternationalAffiliation(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateAffiliationCommand : AbstractValidator<UpdateInternationalAffiliation>
    {
        public ValidateUpdateAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnAffiliation(entities, x => x.Id)
                .WithMessage(MustOwnInternationalAffiliation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Affiliation id", x => x.Id)

                // id must exist in the database
                .MustFindAffiliationById(entities)
                .WithMessage(MustFindInternationalAffiliationById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyAffiliationCommand : IHandleCommands<UpdateInternationalAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateInternationalAffiliationLocation> _createAffiliationLocation;
        private readonly IHandleCommands<DeleteInternationalAffiliationLocation> _deleteAffiliationLocation;


        public HandleUpdateMyAffiliationCommand(ICommandEntities entities,
                                                IUnitOfWork unitOfWork,
                                                IHandleCommands<CreateInternationalAffiliationLocation> createAffiliationLocation,
                                                IHandleCommands<DeleteInternationalAffiliationLocation> deleteAffiliationLocation )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createAffiliationLocation = createAffiliationLocation;
            _deleteAffiliationLocation = deleteAffiliationLocation;
        }

        public void Handle(UpdateInternationalAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the expertise to update. */
            var target = _entities.Get<InternationalAffiliation>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("Affiliation Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            var updated = new InternationalAffiliation
            {
                From = command.From,
                To = command.To,
                OnGoing = command.OnGoing,
                Institution = command.Institution,
                Position = command.Position,
                Locations = command.Locations
            };

            /* If target fields equal new field values, we do not proceed. */
            if (target.Equals(updated))
            {
                return;
            }

            /* Run through all new locations and attempt to find same in target.  If not found, create.*/
            foreach (var location in command.Locations.ToList())
            {
                var targetLocation = target.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (targetLocation == null)
                {
                    var createAffiliationLocation = new CreateInternationalAffiliationLocation(
                        command.Principal, target.RevisionId,location.PlaceId)
                    {
                        NoCommit = true
                    };

                    _createAffiliationLocation.Handle(createAffiliationLocation);
                }
            }

            /* Delete activity locations. Run through the targets list of locations and try to find
                a matching one in the updated list.  If not found, it must have been deleted. */
            foreach (var location in target.Locations.ToList())
            {
                var updateLocation = command.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (updateLocation == null)
                {
                    var deleteAffiliationLocationCommand = new DeleteInternationalAffiliationLocation(
                        command.Principal, location.RevisionId)
                    {
                        NoCommit = true
                    };

                    _deleteAffiliationLocation.Handle(deleteAffiliationLocationCommand);
                }
            }

            /* Update fields */
            target.From = command.From;
            target.To = command.To;
            target.OnGoing = command.OnGoing;
            target.Institution = command.Institution;
            target.Position = command.Position;
            target.Locations = command.Locations;     
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
