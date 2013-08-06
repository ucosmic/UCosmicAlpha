using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class CreateMyAffiliation
    {
        public CreateMyAffiliation(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
        public int? FacultyRankId { get; set; }

        public int CreatedAffiliationId { get; internal set; }
    }

    public class ValidateCreateAffiliationCommand : AbstractValidator<CreateMyAffiliation>
    {
        public ValidateCreateAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EstablishmentId)
                // establishment id must exist in database
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
            ;

            When(x => x.CampusId.HasValue, () =>
                RuleFor(x => x.CampusId.Value)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.CampusId)
            );

            When(x => x.CollegeId.HasValue, () =>
                RuleFor(x => x.CollegeId.Value)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.CollegeId)
            );

            When(x => x.DepartmentId.HasValue, () =>
                RuleFor(x => x.DepartmentId.Value)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.DepartmentId)
            );

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)

                // cannot create a duplicate affiliation
                .MustNotBeAffiliatedWithDepartment(entities,
                    x => x.EstablishmentId, x => x.CampusId, x => x.CollegeId, x => x.DepartmentId)
            ;

            RuleFor(x => x.IsClaimingStudent)
                // cannot claim student unless affiliation establishment is an academic institution
                .MustNotBeClaimingStudentAffiliationForNonInstitutions(entities, x => x.EstablishmentId)
                    .WithMessage(MustNotBeClaimingStudentAffiliationForNonInstitutions<object>.FailMessageFormat, x => x.EstablishmentId)
            ;
        }
    }

    public class HandleCreateAffiliationCommand : IHandleCommands<CreateMyAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateAffiliationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateMyAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the person
            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    p => p.Affiliations,
                })
                .Single(x => x.User != null && x.User.Name.Equals(command.Principal.Identity.Name));

            // construct the affiliation
            var affiliation = new Affiliation
            {
                EstablishmentId = command.EstablishmentId,
                IsClaimingStudent = command.IsClaimingStudent,
                IsClaimingEmployee = command.IsClaimingEmployee,
                IsDefault = !person.Affiliations.Any(a => a.IsDefault),
                CampusId = command.CampusId,
                CollegeId = command.CollegeId,
                DepartmentId = command.DepartmentId,
                FacultyRankId = command.FacultyRankId
            };
            person.Affiliations.Add(affiliation);

            // store
            _entities.Create(affiliation);
            _unitOfWork.SaveChanges();

            // return
            command.CreatedAffiliationId = affiliation.RevisionId;
        }
    }
}
