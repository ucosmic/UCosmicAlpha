using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateFile
    {
        public CreateFile(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; set; }
        public string Visibility { get; set; }
        public Guid? UploadId { get; set; }
    }

    public class ValidateCreateFileCommand : AbstractValidator<CreateFile>
    {
        public ValidateCreateFileCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;

            RuleFor(x => x.AgreementId)
                // agreement id must exist
                .MustFindAgreementById(entities)
                    .WithMessage(MustFindAgreementById.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)
            ;

            // visibility is required
            RuleFor(x => x.Visibility)
                .MustHaveAgreementVisibility()
                    .WithMessage(MustHaveAgreementVisibility.FileFailMessage)
            ;
        }
    }

    public class HandleCreateFileCommand : IHandleCommands<CreateFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryData;

        public HandleCreateFileCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryData
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _binaryData = binaryData;
        }

        public void Handle(CreateFile command)
        {
            
        }
    }
}
