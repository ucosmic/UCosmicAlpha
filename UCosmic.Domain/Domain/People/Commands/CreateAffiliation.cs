using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class CreateAffiliation
    {
        public int PersonId { get; set; }
        public int EstablishmentId { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
        public int? FacultyRankId { get; set; }

        public Affiliation CreatedAffiliation { get; set; }
    }

    public class ValidateCreateAffiliationCommand : AbstractValidator<CreateAffiliation>
    {
        public ValidateCreateAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EstablishmentId)
                // establishment id must exist in database
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
            ;

            RuleFor(x => x.IsClaimingStudent)
                // cannot claim student unless affiliation establishment is an academic institution
                .MustNotBeClaimingStudentAffiliationForNonInstitutions(entities, x => x.EstablishmentId)
                    .WithMessage(MustNotBeClaimingStudentAffiliationForNonInstitutions<object>.FailMessageFormat, x => x.EstablishmentId)
            ;

            RuleFor(x => x.PersonId)
                // person id must exist in database
                .MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)

                // cannot create a duplicate affiliation
                //.MustNotBePersonAffiliatedWithEstablishment(entities, x => x.EstablishmentId)
                //    .WithMessage(MustNotBePersonAffiliatedWithEstablishment<object>.FailMessageFormat, x => x.PersonId, x => x.EstablishmentId)
                .MustNotBePersonAffiliatedWithDepartment( entities,
                                                          establishmentId => establishmentId.EstablishmentId,
                                                          campusId => campusId.CampusId,
                                                          collegeId => collegeId.CollegeId,
                                                          departmentId => departmentId.DepartmentId )
                    .WithMessage(MustNotBePersonAffiliatedWithDepartment<object>.FailMessageFormat, x => x.PersonId, x => x.EstablishmentId)
            ;
        }
    }

    public class HandleCreateAffiliationCommand : IHandleCommands<CreateAffiliation>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateAffiliationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the person
            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    p => p.Affiliations,
                })
                .SingleOrDefault(x => x.RevisionId == command.PersonId);
            if (person == null)
                throw new InvalidOperationException(string.Format("Person with id '{0}' could not be found.", command.PersonId));

            // construct the affiliation
            var affiliation = new Affiliation
            {
                EstablishmentId = command.EstablishmentId,
                IsClaimingStudent = command.IsClaimingStudent,
                IsClaimingEmployee = command.IsClaimingEmployee,
                IsDefault = !person.Affiliations.Any(a => a.IsDefault),
                IsPrimary = command.IsPrimary,
                CampusId = command.CampusId,
                CollegeId = command.CollegeId,
                DepartmentId = command.DepartmentId,
                FacultyRankId = command.FacultyRankId
            };
            person.Affiliations.Add(affiliation);

            // store
            _entities.Create(affiliation);

            // return
            command.CreatedAffiliation = affiliation;
        }
    }
}
