using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.GeographicExpertises
{
    public class UpdateGeographicExpertise
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; set; }
        public int PlaceId { get; set; }
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


        public HandleUpdateMyGeographicExpertiseCommand(ICommandEntities entities,
                                             IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateGeographicExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the degree to update. */
            var target = _entities.Get<GeographicExpertise>().Single(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("GeographicExpertise Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            var updateExpertise = new GeographicExpertise
            {
                PlaceId = command.PlaceId,
                Description = command.Description
            };

            if (target.Equals(updateExpertise))
            {
                return;
            }

            /* Update fields */
            target.PlaceId = command.PlaceId;
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
