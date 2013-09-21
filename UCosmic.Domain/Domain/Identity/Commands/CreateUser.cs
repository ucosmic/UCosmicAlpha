using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class CreateUser
    {
        public CreateUser(IPrincipal principal, string name)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be null or white space.", "name");

            Principal = principal;
            Name = name;
        }

        public IPrincipal Principal { get; private set; }
        public string Name { get; private set; }
        public bool IsRegistered { get; set; }
        public int? PersonId { get; set; }
        internal Person Person { get; set; }

        public int CreatedUserId { get; internal set; }
    }

    public class ValidateCreateUserCommand : AbstractValidator<CreateUser>
    {
        public ValidateCreateUserCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)

                // principal.identity.name cannot be null or empty
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)

                // principal.identity.name must exist as a user
                .MustFindUserByPrincipal(entities)
                .When(x => !x.Principal.IsInRole(RoleName.AuthenticationAgent), ApplyConditionTo.CurrentValidator)

                // principal must be authorized to create user
                .MustBeInAnyRole(RoleName.UserManagers)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;

            RuleFor(x => x.Name)
                // username is requried
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyUserName.FailMessage)

                // usernames are formatted as email addresses
                .EmailAddress()
                    .WithMessage(MustHaveEmailAddressUserName.FailMessage)

                // cannot create a user that does not already exist
                .MustNotFindUserByName(entities)
                    .WithMessage(MustNotFindUserByName.FailMessageFormat, x => x.Name)

                // cannot create a user for an unknown or non-member email domain
                .Must(BeMemberEstablishmentEmailDomain(entities))
                    .WithMessage(InvalidEmailDomainFailMessageFormat, x => x.Name.GetEmailDomain())
            ;

            // tenant managers can only create users using their own email domains
            When(x => !x.Principal.IsInRole(RoleName.AuthorizationAgent)
                   && !x.Principal.IsInRole(RoleName.AuthenticationAgent), () =>
                RuleFor(x => x.Name)
                    .Must((command, name) =>
                        {
                            // get all of the eligible email domains
                            var principalDomain = command.Principal.Identity.Name.GetEmailDomain();
                            var principalEstablishment = entities.Query<Establishment>()
                                .EagerLoad(entities, new Expression<Func<Establishment, object>>[]
                                {
                                    x => x.Offspring.Select(y => y.Offspring.EmailDomains),
                                })
                                .SingleOrDefault(x => x.EmailDomains.Any(y => y.Value.Equals(principalDomain)));
                            if (principalEstablishment == null) return false;
                            var emailDomains = principalEstablishment.EmailDomains.Select(x => x.Value).ToList();
                            var subDomains = principalEstablishment.Offspring.Select(x => x.Offspring)
                                .SelectMany(x => x.EmailDomains.Select(y => y.Value)).ToArray();
                            emailDomains.AddRange(subDomains);
                            return emailDomains.Contains(name.GetEmailDomain());
                        })
                        .WithMessage(InvalidEmailDomainFailMessageFormat, x => x.Name.GetEmailDomain())
            );

            // must find person by id when provided
            When(x => x.PersonId.HasValue, () =>
                RuleFor(x => x.PersonId.Value).MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)
            );
        }

        private const string InvalidEmailDomainFailMessageFormat = "The email domain '{0}' is not eligible for user accounts.";

        private static Func<string, bool> BeMemberEstablishmentEmailDomain(IQueryEntities entities)
        {
            return name =>
            {
                var userDomain = name.GetEmailDomain();
                var establishment = entities.Query<Establishment>()
                    .SingleOrDefault(x => x.EmailDomains.Any(y => y.Value.Equals(userDomain, StringComparison.OrdinalIgnoreCase)));
                return establishment != null && establishment.IsMember;
            };
        }
    }

    public class HandleCreateUserCommand : IHandleCommands<CreateUser>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreatePerson> _createPerson;
        private readonly IProcessEvents _eventProcessor;
        private readonly ILogExceptions _exceptionLogger;

        public HandleCreateUserCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreatePerson> createPerson
            , IProcessEvents eventProcessor
            , ILogExceptions exceptionLogger
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
            _createPerson = createPerson;
            _exceptionLogger = exceptionLogger;
        }

        public void Handle(CreateUser command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // determine which establishment the user should be affiliated with
            var emailDomain = command.Name.GetEmailDomain();
            var establishmentToAffiliate =
                _entities.Get<Establishment>()
                         .Single(
                             x =>
                             x.EmailDomains.Any(y => y.Value.Equals(emailDomain, StringComparison.OrdinalIgnoreCase)));

            
            // default person to the one provided by another internal command
            var person = command.Person;
            if (person == null && command.PersonId.HasValue)
            {
                // get person by id when provided by command
                person = _entities.Get<Person>().Single(x => x.RevisionId == command.PersonId.Value);
            }
            else if (person == null)
            {
                // otherwise, must create a new person
                var createPersonCommand = new CreatePerson
                {
                    DisplayName = command.Name,
                    NoCommit = true,
                };
                _createPerson.Handle(createPersonCommand);
                person = createPersonCommand.CreatedPerson;
            }

            var affiliation = new Affiliation
            {
                IsDefault = true,
                Person = person,
                EstablishmentId = establishmentToAffiliate.RevisionId
            };
            person.Affiliations.Add(affiliation);

            var user = new User
            {
                Name = command.Name,
                IsRegistered = command.IsRegistered,
                TenantId = establishmentToAffiliate.RevisionId,
                Person = person,
            };

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Name,
                    command.PersonId,
                    command.IsRegistered,
                }),
                NewState = user.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Create(user);
            _unitOfWork.SaveChanges();

            command.CreatedUserId = user.RevisionId;

            var userCreatedEvent = new UserCreated(command.Principal, command.CreatedUserId);
            _eventProcessor.Raise(userCreatedEvent);

            /*
             * It is possible that some classes that handle UserCreated events
             * may take a relatively long time to complete.  Because this event
             * is actually spawned in a different Task, for this instance, we
             * want to make sure all actions complete before we consider a User
             * created.
             */
            const int createdUserEventTimeoutMs = 360000;
            try
            {
                userCreatedEvent.Signal.WaitOne(createdUserEventTimeoutMs);
            }
            catch (Exception ex)
            {
                _exceptionLogger.Log(ex);
            }
        }
    }
}
