using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateAffiliation
    {
        /// <summary>
        /// Update Affiliation between the given Principal User's Person and the Establishment with the Id specified.
        /// </summary>
        /// <param name="principal">User whose Person the Affiliation is for.</param>
        /// <param name="establishmentId">Id of the Establishment the Affiliation is currently with.</param>
        /// <param name="newEstablishmentId">Id of the Establishment the Affiliation should change to, if any.</param>
        public UpdateAffiliation(IPrincipal principal, int establishmentId, int? newEstablishmentId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
            NewEstablishmentId = newEstablishmentId;
        }

        /// <summary>
        /// Update Affiliation between the Person and Establishment with the Id's specified, as long as the Principal User is authorized to do so.
        /// </summary>
        /// <param name="principal">User who must be authorized as an agent for Person with specified personId.</param>
        /// <param name="personId">Id of the Person the Affiliation is for.</param>
        /// <param name="establishmentId">Id of the Establishment the Affiliation is with.</param>
        /// <param name="newEstablishmentId">Id of the Establishment the Affiliation should change to, if any.</param>
        public UpdateAffiliation(IPrincipal principal, int personId, int establishmentId, int? newEstablishmentId = null)
            :this(principal, establishmentId, newEstablishmentId)
        {
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
        public int? NewEstablishmentId { get; private set; }

        /// <summary>
        /// Id of the Person the affiliation for. When null, Affiliation is for the Principal's Person.
        /// </summary>
        public int? PersonId { get; private set; }

        public string JobTitles { get; set; }
        public int? FacultyRankId { get; set; }
    }

    public class ValidateUpdateAffiliationCommand : AbstractValidator<UpdateAffiliation>
    {
        public ValidateUpdateAffiliationCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when personId is null, affiliation will be for principal's user.person
            // when personId is provided, must authorize principal to update affiliation
            // possible TODO: add intenal constructor without Principal for system use..?

            // principal must match user (which guarantees person)
            RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);

            // new establishment must exist when provided
            When(x => x.NewEstablishmentId.HasValue, () =>
                RuleFor(x => x.NewEstablishmentId.Value).MustFindEstablishmentById(queryProcessor)
            );

            When(x => !x.PersonId.HasValue, () =>
                RuleFor(x => x.Principal)
                    // must find affiliation by primary key
                    .MustBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // cannot be duplicate of another establishment
                    .MustNotBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.NewEstablishmentId.HasValue ? x.NewEstablishmentId.Value : 0)
                        .When(x => x.NewEstablishmentId.HasValue && x.NewEstablishmentId.Value != x.EstablishmentId, ApplyConditionTo.CurrentValidator)

                    // establishment id must be offspring of the user's default affiliation
                    .MustHaveDefaultAffiliationWithOffspring(queryProcessor, x => x.NewEstablishmentId.HasValue ? x.NewEstablishmentId.Value : 0)
                        .When(x => x.NewEstablishmentId.HasValue, ApplyConditionTo.CurrentValidator)
            );

            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    // must find person by id
                    .MustFindPersonById(queryProcessor)

                    // must find affiliation by primary key
                    .MustBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // cannot be duplicate establishment
                    .MustNotBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.NewEstablishmentId.HasValue ? x.NewEstablishmentId.Value : 0)
                        .When(x => x.NewEstablishmentId.HasValue && x.NewEstablishmentId.Value != x.EstablishmentId, ApplyConditionTo.CurrentValidator)

                    // establishment id must be offspring of the person's default affiliation
                    .MustHaveDefaultAffiliationWithOffspring(queryProcessor, x => x.NewEstablishmentId.HasValue ? x.NewEstablishmentId.Value : 0)
                        .When(x => x.NewEstablishmentId.HasValue, ApplyConditionTo.CurrentValidator)
                ;

                // make sure user is authorized to update this affiliation
                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                    .MustBeAgentForPerson(queryProcessor, x => x.PersonId.HasValue ? x.PersonId.Value : 0)
                ;
            });

            When(x => x.FacultyRankId.HasValue, () =>
                // when facultyRank, must be associated
                RuleFor(x => x.FacultyRankId.Value)
                    .MustBeFacultyRankForEstablishment(queryProcessor, x => x.NewEstablishmentId.HasValue ? x.NewEstablishmentId.Value : x.EstablishmentId)
            );

            // validate job titles length
            When(x => !string.IsNullOrWhiteSpace(x.JobTitles), () =>
                RuleFor(x => x.JobTitles).Length(0, AffiliationConstraints.JobTitlesMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Position Title(s)", x => AffiliationConstraints.JobTitlesMaxLength, x => x.JobTitles.Length)
            );
        }
    }

    public class HandleUpdateAffiliationCommand : IHandleCommands<UpdateAffiliation>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateAffiliationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = !command.PersonId.HasValue
                ? _entities.Get<Affiliation>().Single(x => x.EstablishmentId == command.EstablishmentId
                    && x.Person.User != null
                    && x.Person.User.Name.Equals(command.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase))
                : _entities.Get<Affiliation>().Single(x => x.EstablishmentId == command.EstablishmentId
                    && x.PersonId == command.PersonId.Value);

            entity.JobTitles = command.JobTitles;
            entity.FacultyRankId = command.FacultyRankId;

            // can update the establishment as long as it is not the default
            if (!entity.IsDefault && command.NewEstablishmentId.HasValue && command.NewEstablishmentId.Value != command.EstablishmentId)
            {
                entity.EstablishmentId = command.NewEstablishmentId.Value;
            }

            _entities.SaveChanges();
        }
    }
}
