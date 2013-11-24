using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class PurgeAffiliation
    {
        /// <summary>
        /// Delete Affiliation between the given Principal User's Person and the Establishment with the Id specified.
        /// </summary>
        /// <param name="principal">User whose Person the Affiliation is for.</param>
        /// <param name="establishmentId">Id of the Establishment the Affiliation is currently with.</param>
        public PurgeAffiliation(IPrincipal principal, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
        }

        /// <summary>
        /// Delete Affiliation between the Person and Establishment with the Id's specified, as long as the Principal User is authorized to do so.
        /// </summary>
        /// <param name="principal">User who must be authorized as an agent for Person with specified personId.</param>
        /// <param name="personId">Id of the Person the Affiliation is for.</param>
        /// <param name="establishmentId">Id of the Establishment the Affiliation is with.</param>
        public PurgeAffiliation(IPrincipal principal, int personId, int establishmentId)
            :this(principal, establishmentId)
        {
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }

        /// <summary>
        /// Id of the Person the affiliation is for. When null, Affiliation is for the Principal's Person.
        /// </summary>
        public int? PersonId { get; private set; }
    }

    public class ValidatePurgeAffiliationCommand : AbstractValidator<PurgeAffiliation>
    {
        public ValidatePurgeAffiliationCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when personId is null, affiliation will be for principal's user.person
            // when personId is provided, must authorize principal to delete affiliation
            // possible TODO: add intenal constructor without Principal for system use..?

            // principal must match user (which guarantees person)
            RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);

            When(x => !x.PersonId.HasValue, () =>
                RuleFor(x => x.Principal)
                    // must find affiliation by primary key
                    .MustBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // must not be default establishment
                    .MustNotHaveDefaultAffiliationWithEstablishment(queryProcessor, x => x.EstablishmentId)
            );

            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    // must find person by id
                    .MustFindPersonById(queryProcessor)

                    // must find affiliation by primary key
                    .MustBeDirectlyAffiliatedWithEstablishment(queryProcessor, x => x.EstablishmentId)

                    // must not be default establishment
                    .MustNotHaveDefaultAffiliationWithEstablishment(queryProcessor, x => x.EstablishmentId)
                ;

                // make sure user is authorized to delete this affiliation
                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                    .MustBeAgentForPerson(queryProcessor, x => x.PersonId.HasValue ? x.PersonId.Value : 0)
                ;
            });
        }
    }

    public class HandlePurgeAffiliationCommand : IHandleCommands<PurgeAffiliation>
    {
        private readonly ICommandEntities _entities;

        public HandlePurgeAffiliationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(PurgeAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = !command.PersonId.HasValue
                ? _entities.Get<Affiliation>().Single(x => x.EstablishmentId == command.EstablishmentId
                    && x.Person.User != null
                    && x.Person.User.Name.Equals(command.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase))
                : _entities.Get<Affiliation>().Single(x => x.EstablishmentId == command.EstablishmentId
                    && x.PersonId == command.PersonId.Value);

            _entities.Purge(entity);
            _entities.SaveChanges();
        }
    }
}
