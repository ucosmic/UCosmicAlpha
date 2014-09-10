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
    public class CreateHomeSection
    {
        public CreateHomeSection(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; set; }
        internal HomeSection HomeSection { get; set; }
        public ICollection<HomeLink> Links { get; set; }
        //public IEnumerable<CreateHomeLink> HomeLinks { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        internal bool NoCommit { get; set; }
        public int CreatedHomeSectionId { get; internal set; }
    }

    public class ValidateCreateHomeSectionCommand : AbstractValidator<CreateHomeSection>
    {
        public ValidateCreateHomeSectionCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when homeSectionId is null, update the principal's homeSection
            // principal must match user (which guarantees homeSection)
            //RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);
            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.SecurityAdministrator)
            ;

            //When(x => x.HomeSectionId, () =>
            //{
            RuleFor(x => x.EstablishmentId)
                .MustFindEstablishmentById(queryProcessor)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId);

                // make sure user is authorized to update this homeSection
                //RuleFor(x => x.Principal)
                //    .MustBeAgentForHomeSection(queryProcessor, x => x.HomeSectionId.HasValue ? x.HomeSectionId.Value : 0)
                //;
            //});

            // when first and last name are not provided, display name cannot be empty
            //When(x => string.IsNullOrWhiteSpace(x.Title) || string.IsNullOrWhiteSpace(x.Description), () =>
            //    RuleFor(x => x.DisplayName)
            //        // display name cannot be empty
            //        .NotEmpty().WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            //);
        }
    }

    public class HandleCreateHomeSectionCommand : IHandleCommands<CreateHomeSection>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateHomeLink> _createHomeLink;

        public HandleCreateHomeSectionCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreateHomeLink> createHomeLink
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createHomeLink = createHomeLink;
        }

        public void Handle(CreateHomeSection command)
        {
            if (command == null) throw new ArgumentNullException("command");


            var entity = new HomeSection
            {
                Title = command.Title,
                Description = command.Description,
                EstablishmentId = command.EstablishmentId
            };

            //first delete all links

            //create all links
            foreach (var homeLink in command.Links)
                _createHomeLink.Handle(new CreateHomeLink(command.Principal, entity.Id, homeLink)
                {
                    NoCommit = true,
                    //IsOwner = participant.IsOwner,
                });

            _entities.Create(entity);
            _unitOfWork.SaveChanges();
            command.CreatedHomeSectionId = entity.Id;
        }
    }
}
