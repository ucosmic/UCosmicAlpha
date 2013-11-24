using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class CreateAffiliation
    {
        /// <summary>
        /// Create an Affiliation between the given Principal User's Person and the Establishment with the Id specified.
        /// </summary>
        /// <param name="principal">User whose Person the Affiliation will be created for.</param>
        /// <param name="establishmentId">Id of the Establishment the Affiliation will be created with.</param>
        public CreateAffiliation(IPrincipal principal, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
        }

        /// <summary>
        /// Create an Affiliation between the Person and Establishment with the Id's specified, as long as the Principal User is authorized to do so.
        /// </summary>
        /// <param name="principal">User who must be authorized as an agent for Person with specified personId.</param>
        /// <param name="personId">Id of the Person for whom the Affiliation will be created.</param>
        /// <param name="establishmentId">Id of the Establishment which the Affiliation will be created with.</param>
        public CreateAffiliation(IPrincipal principal, int personId, int establishmentId)
            :this(principal, establishmentId)
        {
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }

        /// <summary>
        /// Id of the Person to create the affiliation for. When null, create an Affiliation for the Principal's Person.
        /// </summary>
        public int? PersonId { get; private set; }

        public string JobTitles { get; set; }
        public int? FacultyRankId { get; set; }

        public Affiliation Created { get; internal set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateAffiliationCommand : AbstractValidator<CreateAffiliation>
    {
        public ValidateCreateAffiliationCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when personId is null, create affiliation for principal's user.person
            // when personId is provided, must authorize principal to create affiliation
            // possible TODO: add intenal constructor without Principal for system use..?

            // principal must match user (which guarantees person)
            RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);

            // establishment must exist
            RuleFor(x => x.EstablishmentId).MustFindEstablishmentById(queryProcessor);

            When(x => !x.PersonId.HasValue, () =>
                RuleFor(x => x.Principal)
                    // cannot be duplicate establishment
                    .MustNotBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // establishment id must be offspring of the user's default affiliation
                    .MustHaveDefaultAffiliationWithOffspring(queryProcessor, x => x.EstablishmentId)
            );

            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    // must find person by id
                    .MustFindPersonById(queryProcessor)

                    // cannot be duplicate establishment
                    .MustNotBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // establishment id must be offspring of the person's default affiliation
                    .MustHaveDefaultAffiliationWithOffspring(queryProcessor, x => x.EstablishmentId)
                ;

                // make sure user is authorized to create this affiliation
                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                    .MustBeAgentForPerson(queryProcessor, x => x.PersonId.HasValue ? x.PersonId.Value : 0)
                ;
            });

            When(x => x.FacultyRankId.HasValue, () =>
                // when facultyRank, must be associated
                RuleFor(x => x.FacultyRankId.Value).MustBeFacultyRankForEstablishment(queryProcessor, x => x.EstablishmentId)
            );

            // validate job titles length
            When(x => !string.IsNullOrWhiteSpace(x.JobTitles), () =>
                RuleFor(x => x.JobTitles).Length(0, AffiliationConstraints.JobTitlesMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Position Title(s)", x => AffiliationConstraints.JobTitlesMaxLength, x => x.JobTitles.Length)
            );
        }
    }

    public class HandleCreateAffiliationCommand : IHandleCommands<CreateAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleCreateAffiliationCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public void Handle(CreateAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var personId = !command.PersonId.HasValue
                ? _queryProcessor.Execute(new MyPerson(command.Principal)).RevisionId
                : command.PersonId.Value;

            var entity = new Affiliation
            {
                PersonId = personId,
                EstablishmentId = command.EstablishmentId,
                FacultyRankId = command.FacultyRankId,
                JobTitles = command.JobTitles,
            };

            _entities.Create(entity);
            if (command.NoCommit)
            {
                command.Created = entity;
                return;
            }

            _entities.SaveChanges();
            command.Created = _queryProcessor.Execute(new AffiliationByPrimaryKey(entity.PersonId, entity.EstablishmentId));
        }
    }
}
