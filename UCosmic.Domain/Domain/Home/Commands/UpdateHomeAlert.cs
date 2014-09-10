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
    public class UpdateHomeAlert
    {
        public UpdateHomeAlert(IPrincipal principal, int homeAlertId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            HomeAlertId = homeAlertId;
        }

        public IPrincipal Principal { get; private set; }
        public int HomeAlertId { get; private set; }
        internal HomeAlert HomeAlert { get; set; }
        //public IEnumerable<CreateHomeLink> HomeLinks { get; set; }
        public string Text { get; set; }

        internal bool NoCommit { get; set; }

    }

    public class ValidateUpdateHomeAlertCommand : AbstractValidator<UpdateHomeAlert>
    {
        public ValidateUpdateHomeAlertCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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
            
            RuleFor(x => x.HomeAlertId)
                // agreement id must exist
                .MustFindHomeAlertById(entities)
                    .WithMessage(MustFindHomeAlertById<object>.FailMessageFormat, x => x.HomeAlertId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.HomeAlertId, x => x.Principal.Identity.Name)
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


    public class HandleUpdateHomeAlertCommand : IHandleCommands<UpdateHomeAlert>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateHomeLink> _createHomeLink;

        public HandleUpdateHomeAlertCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreateHomeLink> createHomeLink
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createHomeLink = createHomeLink;
        }

        public void Handle(UpdateHomeAlert command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<HomeAlert>().Single(x => x.Id == command.HomeAlertId);


            //var entity = new HomeAlert
            //{
            entity.Text = command.Text;
            //};


            _entities.Update(entity);
            _unitOfWork.SaveChanges();
        }
    }
}