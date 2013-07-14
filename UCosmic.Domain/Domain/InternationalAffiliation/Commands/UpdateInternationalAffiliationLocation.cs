using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class UpdateInternationalAffiliationLocation
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; set; }
        public int PlaceId { get; set; }
        public DateTime UpdatedOn { get; set; }
        public bool NoCommit { get; set; }

        public UpdateInternationalAffiliationLocation()
        {
        }

        public UpdateInternationalAffiliationLocation(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateAffiliationLocationCommand : AbstractValidator<UpdateInternationalAffiliationLocation>
    {
        public ValidateUpdateAffiliationLocationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnAffiliationLocation(entities, x => x.Id)
                .WithMessage(MustOwnAffiliationLocation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "AffiliationLocation id", x => x.Id)

                // id must exist in the database
                .MustFindAffiliationLocationById(entities)
                .WithMessage(MustFindInternationalAffiliationLocationById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyAffiliationLocationCommand : IHandleCommands<UpdateInternationalAffiliationLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;


        public HandleUpdateMyAffiliationLocationCommand(ICommandEntities entities,
                                                                IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateInternationalAffiliationLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the affiliation location to update. */
            var target = _entities.Get<InternationalAffiliationLocation>().Single(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("AffiliationLocation Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            var updateExpertise = new InternationalAffiliationLocation
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
