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
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
    }

    public class ValidateCreateAffiliationCommand : AbstractValidator<CreateAffiliation>
    {
        public ValidateCreateAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            //Person person = null;
            //Establishment establishment = null;

            //var establishmentLoad = new Expression<Func<Establishment, object>>[]
            //{
            //    e => e.Type.Category,
            //};
            //var personLoad = new Expression<Func<Person, object>>[]
            //{
            //   x => x.Affiliations.Select(y => y.Establishment)
            //};

            RuleFor(x => x.EstablishmentId)
                // establishment id must exist in database
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
                //.Must(p => ValidateEstablishment.IdMatchesEntity(p, entities, establishmentLoad, out establishment))
                //    .WithMessage(ValidateEstablishment.FailedBecauseIdMatchedNoEntity,
                //        p => p.EstablishmentId)

            ;

            RuleFor(p => p.IsClaimingStudent)
                // cannot claim student unless affiliation establishment is an academic institution
                .MustNotBeClaimingStudentAffiliationForNonInstitutions(entities, x => x.EstablishmentId)
                    .WithMessage(MustNotBeClaimingStudentAffiliationForNonInstitutions<object>.FailMessageFormat, x => x.EstablishmentId)
                //.Must(p => ValidateAffiliation.EstablishmentIsInstitutionWhenIsClaimingStudent(p, establishment))
                //    //.When(p => establishment != null)
                //    .WithMessage(ValidateAffiliation.FailedBecauseIsClaimingStudentButEstablishmentIsNotInstitution,
                //        p => p.EstablishmentId)
            ;

            RuleFor(p => p.PersonId)
                // person id must exist in database
                .MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)
                //.Must(p => ValidatePerson.IdMatchesEntity(p, entities, personLoad, out person))
                //    .WithMessage(ValidatePerson.FailedBecauseIdMatchedNoEntity,
                //        p => p.PersonId)
                // cannot create a duplicate affiliation
                .MustNotBePersonAffiliatedWithEstablishment(entities, x => x.EstablishmentId)
                    .WithMessage(MustNotBePersonAffiliatedWithEstablishment<object>.FailMessageFormat, x => x.PersonId, x => x.EstablishmentId)
                //.Must((o, p) => ValidatePerson.IsNotAlreadyAffiliatedWithEstablishment(person, o.EstablishmentId))
                //    .WithMessage(ValidatePerson.FailedBecausePersonIsAlreadyAffiliatedWithEstablishment,
                //        p => p.PersonId, p => p.EstablishmentId)
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
            };
            person.Affiliations.Add(affiliation);

            // store
            _entities.Create(affiliation);
        }
    }
}
