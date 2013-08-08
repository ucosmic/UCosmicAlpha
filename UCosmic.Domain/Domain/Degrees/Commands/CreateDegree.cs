using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class CreateDegree
    {
        public CreateDegree(IPrincipal principal, int? personId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int? PersonId { get; private set; }
        public Guid? EntityId { get; set; }
        public string Title { get; set; }
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }

        public int CreatedDegreeId { get; internal set; }
        internal Degree CreatedDegree { get; set; }
        internal bool NoCommit { get; set; }

    }

    public class ValidateCreateDegreeCommand : AbstractValidator<CreateDegree>
    {
        public ValidateCreateDegreeCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(queryProcessor)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;

            // only admins can create degrees for other people (PersonId.HasValue)
            // normal users can only create degrees for themselves (!PersonId.HasValue)
            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                        .WithMessage(MustBeInAnyRole.FailMessageFormat,
                                x => x.Principal.Identity.Name, x => x.GetType().Name)
                ;

                RuleFor(x => x.PersonId.Value)
                    .MustFindPersonById(queryProcessor)
                        .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)

                    .MustBeTenantPersonId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantPersonId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.PersonId)
                ;
            });

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage(MustHaveTitle.FailMessage)
                .Length(1, DegreeConstraints.TitleMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Degree", x => DegreeConstraints.TitleMaxLength, x => x.Title.Length)
            ;

            When(x => !string.IsNullOrWhiteSpace(x.FieldOfStudy), () =>
                RuleFor(x => x.FieldOfStudy)
                    .Length(1, DegreeConstraints.FieldOfStudyMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Field of study, if provided", x => DegreeConstraints.FieldOfStudyMaxLength, x => x.FieldOfStudy.Length)
            );

            When(x => x.YearAwarded.HasValue, () =>
                RuleFor(x => x.YearAwarded.Value)
                    .GreaterThanOrEqualTo(DegreeConstraints.YearAwardedMinValue)
                        .WithMessage(MustHaveYearAwardedInRange.FailMessage)
            );

            When(x => x.InstitutionId.HasValue, () =>
                RuleFor(x => x.InstitutionId.Value)
                    .MustFindEstablishmentById(queryProcessor)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.InstitutionId)
            );
        }
    }

    public class HandleCreateDegreeCommand : IHandleCommands<CreateDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateDegreeCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = command.PersonId.HasValue
                ? _queryProcessor.Execute(new PersonById(command.PersonId.Value))
                : _queryProcessor.Execute(new MyPerson(command.Principal));

            var entity = new Degree
            {
                PersonId = person.RevisionId,
                Title = command.Title,
                FieldOfStudy = command.FieldOfStudy,
                YearAwarded = command.YearAwarded,
                InstitutionId = command.InstitutionId,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                entity.EntityId = command.EntityId.Value;
            }

            _entities.Create(entity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedDegree = entity;
            command.CreatedDegreeId = command.CreatedDegree.RevisionId;
        }
    }
}
