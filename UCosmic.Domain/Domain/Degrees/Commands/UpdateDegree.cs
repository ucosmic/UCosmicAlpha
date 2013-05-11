using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Degrees
{
    public class UpdateDegree
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; set; }
        public string Title { get; set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        public DateTime UpdatedOn { get; set; }
        public bool NoCommit { get; set; }

        public UpdateDegree()
        {
        }

        public UpdateDegree(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateDegreeCommand : AbstractValidator<UpdateDegree>
    {
        public ValidateUpdateDegreeCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnDegree(entities, x => x.Id)
                .WithMessage(MustOwnDegree<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Degree id", x => x.Id)

                // id must exist in the database
                .MustFindDegreeById(entities)
                .WithMessage(MustFindDegreeById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyDegreeCommand : IHandleCommands<UpdateDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;


        public HandleUpdateMyDegreeCommand(ICommandEntities entities,
                                             IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the degree to update. */
            var target = _entities.Get<Degree>().Single(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("Degree Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            /* Update fields */
            target.Title = command.Title;
            target.YearAwarded = command.YearAwarded;
            target.InstitutionId = command.InstitutionId;
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
