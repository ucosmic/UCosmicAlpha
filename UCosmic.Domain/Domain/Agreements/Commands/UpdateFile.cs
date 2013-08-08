using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class UpdateFile
    {
        public UpdateFile(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; set; }
        public int FileId { get; set; }
        public string Visibility { get; set; }
        public string CustomName { get; set; }
    }

    public class ValidateUpdateFileCommand : AbstractValidator<UpdateFile>
    {
        public ValidateUpdateFileCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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
                    .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)

                // file id must exist under this agreement
                .MustOwnFileWithId(entities, x => x.FileId)
                    .WithMessage(MustOwnFileWithId<object>.FailMessageFormat, x => x.AgreementId, x => x.FileId)
            ;

            // visibility is required
            RuleFor(x => x.Visibility)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementVisibility.FailMessage)
                .MustHaveAgreementVisibility()
                    .WithMessage(MustHaveAgreementVisibility.FileFailMessage)
            ;

            // when custom name is provided
            When(x => !string.IsNullOrWhiteSpace(x.CustomName), () =>
                RuleFor(x => x.CustomName)
                    .Length(1, AgreementFileConstraints.NameMaxLength)
                        .WithMessage(MustNotExceedFileNameLength.FailMessageFormat, x => AgreementFileConstraints.NameMaxLength)
            );
        }
    }

    public class HandleUpdateFileCommand : IHandleCommands<UpdateFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateFileCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementFile>().Single(x => x.Id == command.FileId);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.FileId,
                    command.CustomName,
                    command.Visibility,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            entity.Visibility = command.Visibility.AsEnum<AgreementVisibility>();
            entity.Name = HandleCreateFileCommand.GetExtensionedCustomName(command.CustomName, entity.FileName);
            entity.UpdatedByPrincipal = command.Principal.Identity.Name;
            entity.UpdatedOnUtc = DateTime.UtcNow;

            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
