using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class UpdateDegree
    {
        public UpdateDegree(IPrincipal principal, int degreeId, int? personId = null)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            DegreeId = degreeId;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int DegreeId { get; private set; }
        public int? PersonId { get; private set; }
        public string Title { get; set; }
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateDegreeCommand : AbstractValidator<UpdateDegree>
    {
        public ValidateUpdateDegreeCommand(IProcessQueries queryProcessor)
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

            RuleFor(x => x.DegreeId)
                // id must exist in the database
                .MustFindDegreeById(queryProcessor)
                    .WithMessage(MustFindDegreeById.FailMessageFormat, x => x.DegreeId)
            ;

            // only admins can update degrees for other people (PersonId.HasValue)
            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    .MustFindPersonById(queryProcessor)
                        .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)

                    .MustBeTenantPersonId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantPersonId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.PersonId)
                ;

                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                        .WithMessage(MustBeInAnyRole.FailMessageFormat,
                                x => x.Principal.Identity.Name, x => x.GetType().Name)

                    .MustControlDegree(queryProcessor, x => x.DegreeId)
                        .WithMessage(MustControlDegree<object>.FailMessageFormat,
                                x => x.Principal.Identity.Name, x => x.DegreeId)
                    ;
            });

            // normal users can only update degrees for themselves (!PersonId.HasValue)
            When(x => !x.PersonId.HasValue, () =>
                RuleFor(x => x.Principal)
                    .MustOwnDegree(queryProcessor, x => x.DegreeId)
                        .WithMessage(MustOwnDegree<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.DegreeId)
            );

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

    public class HandleUpdateMyDegreeCommand : IHandleCommands<UpdateDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateMyDegreeCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the degree to update. */
            var target = _entities.Get<Degree>().Single(a => a.RevisionId == command.DegreeId);

            var updateDegree = new Degree
            {
                Title = command.Title,
                FieldOfStudy = command.FieldOfStudy,
                YearAwarded = command.YearAwarded,
                InstitutionId = command.InstitutionId
            };

            if (target.Equals(updateDegree))
            {
                return;
            }

            /* Update fields */
            target.Title = command.Title;
            target.FieldOfStudy = command.FieldOfStudy;
            target.YearAwarded = command.YearAwarded;
            target.InstitutionId = command.InstitutionId;
            target.UpdatedOnUtc = DateTime.UtcNow;
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
