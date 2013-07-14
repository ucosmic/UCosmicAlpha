using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeleteMyAffiliation
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }

        public DeleteMyAffiliation(IPrincipal principal, int id)
        {
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteAffliliationCommand : AbstractValidator<DeleteMyAffiliation>
    {
        public ValidateDeleteAffliliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;
        }
    }

    public class HandleDeleteAffliliationCommand : IHandleCommands<DeleteMyAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteAffliliationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteMyAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var affiliation = _entities.Get<Affiliation>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (affiliation == null) { throw new Exception("Affiliation not found."); }

            _entities.Purge(affiliation);
            _unitOfWork.SaveChanges();
        }
    }
}
