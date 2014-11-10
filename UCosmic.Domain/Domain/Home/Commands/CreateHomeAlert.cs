using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Home;
using UCosmic.Domain.Identity;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Home
{
    public class CreateHomeAlert
    {
        public CreateHomeAlert(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; set; }
        internal HomeAlert HomeAlert { get; set; }
        public string Text { get; set; }
        public bool IsDisabled { get; set; }

        internal bool NoCommit { get; set; }
        public int CreatedHomeAlertId { get; internal set; }
    }

    public class ValidateCreateHomeAlertCommand : AbstractValidator<CreateHomeAlert>
    {
        public ValidateCreateHomeAlertCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when homeAlertId is null, update the principal's homeAlert
            // principal must match user (which guarantees homeAlert)
            //RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);
            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.SecurityAdministrator)
            ;

            RuleFor(x => x.EstablishmentId)
                .MustFindEstablishmentById(queryProcessor)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId);

        }
    }

    public class HandleCreateHomeAlertCommand : IHandleCommands<CreateHomeAlert>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateHomeLink> _createHomeLink;

        public HandleCreateHomeAlertCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreateHomeLink> createHomeLink
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createHomeLink = createHomeLink;
        }

        public void Handle(CreateHomeAlert command)
        {
            if (command == null) throw new ArgumentNullException("command");


            var entity = new HomeAlert
            {
                Text = command.Text,
                EstablishmentId = command.EstablishmentId,
                IsDisabled = command.IsDisabled
            };

            _entities.Create(entity);
            _unitOfWork.SaveChanges();
            command.CreatedHomeAlertId = entity.Id;
        }
    }
}
