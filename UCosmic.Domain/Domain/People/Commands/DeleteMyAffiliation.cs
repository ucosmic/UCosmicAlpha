using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeleteMyAffiliation
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }

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
                .MustOwnAffiliation(entities, x => x.Id)
                    .WithMessage(MustOwnAffiliation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id)
            ;

            // cannot delete default affiliation
            RuleFor(x => x.Id)
                .MustFindAffiliationById(entities)
                    .WithMessage(MustFindAffiliationById.FailMessageFormat, x => x.Id)
                .MustNotBeDefaultAffiliation(entities)
                    .WithMessage("Your affiliation with id '{0}' cannot be deleted because it is your default affiliation.", x => x.Id);
        }
    }

    public class HandleDeleteAffliliationCommand : IHandleCommands<DeleteMyAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleDeleteAffliliationCommand(ICommandEntities entities,
                                               IUnitOfWork unitOfWork,
                                               IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(DeleteMyAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var affiliation = _entities.Get<Affiliation>().Single(a => a.RevisionId == command.Id);

            _entities.Purge(affiliation);
            _unitOfWork.SaveChanges();

            _eventProcessor.Raise(new AffiliationChanged());
        }
    }
}
