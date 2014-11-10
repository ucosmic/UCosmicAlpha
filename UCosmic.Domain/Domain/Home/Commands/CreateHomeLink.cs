using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Home;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class CreateHomeLink
    {
        public CreateHomeLink() { }

        public CreateHomeLink(IPrincipal principal, int homeSectionId, HomeLink homeLink)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            HomeSectionId = homeSectionId;
            HomeLink = homeLink;
        }

        internal HomeLink HomeLink { get; private set; }
        public IPrincipal Principal { get; private set; }
        public int HomeSectionId { get; private set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateHomeLinkCommand : AbstractValidator<CreateHomeLink>
    {
        public ValidateCreateHomeLinkCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.SecurityAdministrator)
            ;
        }
    }

    public class HandleCreateHomeLinkCommand : IHandleCommands<CreateHomeLink>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateHomeLinkCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateHomeLink command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(command.Principal));

            var entity = new HomeLink
            {
                Url = command.HomeLink.Url,
                Text = command.HomeLink.Text,
                HomeSectionId = command.HomeLink.HomeSectionId,
            };
            
            _entities.Create(entity);
            if (!command.NoCommit) _unitOfWork.SaveChanges();
        }
    }
}