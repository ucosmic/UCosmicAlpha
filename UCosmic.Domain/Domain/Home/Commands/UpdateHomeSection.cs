using System;
using System.Linq;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Home;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class UpdateHomeSection
    {
        public UpdateHomeSection(IPrincipal principal, int homeSectionId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            HomeSectionId = homeSectionId;
        }

        public IPrincipal Principal { get; private set; }
        public int HomeSectionId { get; private set; }
        internal HomeSection HomeSection { get; set; }
        public HomeLink[] HomeLinks { get; set; }
        //public IEnumerable<CreateHomeLink> HomeLinks { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        internal bool NoCommit { get; set; }

    }

    public class ValidateUpdateHomeSectionCommand : AbstractValidator<UpdateHomeSection>
    {
        public ValidateUpdateHomeSectionCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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
            
            RuleFor(x => x.HomeSectionId)
                // agreement id must exist
                .MustFindHomeSectionById(entities)
                    .WithMessage(MustFindHomeSectionById<object>.FailMessageFormat, x => x.HomeSectionId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.HomeSectionId, x => x.Principal.Identity.Name)
                ;

            //});

            // when first and last name are not provided, display name cannot be empty
            //When(x => string.IsNullOrWhiteSpace(x.Title) || string.IsNullOrWhiteSpace(x.Description), () =>
            //    RuleFor(x => x.DisplayName)
            //        // display name cannot be empty
            //        .NotEmpty().WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            //);
        }
    }


    public class HandleUpdateHomeSectionCommand : IHandleCommands<UpdateHomeSection>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateHomeLink> _createHomeLink;

        public HandleUpdateHomeSectionCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreateHomeLink> createHomeLink
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createHomeLink = createHomeLink;
        }

        public void Handle(UpdateHomeSection command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<HomeSection>().Single(x => x.Id == command.HomeSectionId);


            //var entity = new HomeSection
            //{
            entity.Title = command.Title;
            entity.Description = command.Description;
            //};

            //first delete all links

            //create all links
            foreach (var homeLink in command.HomeLinks)
                _createHomeLink.Handle(new CreateHomeLink(command.Principal, entity.Id, homeLink)
                {
                    NoCommit = true,
                    //IsOwner = participant.IsOwner,
                });

            _entities.Update(entity);
            _unitOfWork.SaveChanges();
        }
    }
}