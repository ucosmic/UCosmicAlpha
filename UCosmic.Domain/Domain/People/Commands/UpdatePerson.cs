using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdatePerson
    {
        public UpdatePerson(IPrincipal principal, int? personId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int? PersonId { get; private set; }
        internal Person Person { get; set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdatePersonCommand : AbstractValidator<UpdatePerson>
    {
        public ValidateUpdatePersonCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when personId is null, update the principal's person
            // principal must match user (which guarantees person)
            RuleFor(x => x.Principal).MustFindUserByPrincipal(queryProcessor);

            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    // must find person by id
                    .MustFindPersonById(queryProcessor)
                ;

                // make sure user is authorized to update this person
                RuleFor(x => x.Principal)
                    .MustBeAgentForPerson(queryProcessor, x => x.PersonId.HasValue ? x.PersonId.Value : 0)
                ;
            });

            // when first and last name are not provided, display name cannot be empty
            When(x => string.IsNullOrWhiteSpace(x.FirstName) || string.IsNullOrWhiteSpace(x.LastName), () =>
                RuleFor(x => x.DisplayName)
                    // display name cannot be empty
                    .NotEmpty().WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            );
        }
    }

    public class HandleUpdatePersonCommand : IHandleCommands<UpdatePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleUpdatePersonCommand(ICommandEntities entities
                , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public void Handle(UpdatePerson command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            // load target entity
            var entity = command.Person;
            if (entity == null)
            {
                var queryable = _entities.Get<Person>();
                entity = command.PersonId.HasValue
                    ? queryable.Single(x => x.RevisionId == command.PersonId.Value)
                    : queryable.ByUserName(command.Principal.Identity.Name, false);
            }

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    PersonId = command.Person != null ? command.Person.RevisionId : command.PersonId,
                    command.IsActive,
                    command.IsDisplayNameDerived,
                    command.DisplayName,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.Gender,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            // update values
            entity.IsActive = command.IsActive;
            entity.Salutation = command.Salutation;
            entity.FirstName = command.FirstName;
            entity.MiddleName = command.MiddleName;
            entity.LastName = command.LastName;
            entity.Suffix = command.Suffix;
            entity.Gender = command.Gender;
            if (string.IsNullOrWhiteSpace(command.DisplayName))
            {
                entity.DisplayName = _queryProcessor.Execute(new GenerateDisplayName
                {
                    Salutation = command.Salutation,
                    FirstName = command.FirstName,
                    MiddleName = command.MiddleName,
                    LastName = command.LastName,
                    Suffix = command.Suffix,
                });
                entity.IsDisplayNameDerived = true;
            }
            else
            {
                entity.DisplayName = command.DisplayName;
                entity.IsDisplayNameDerived = command.IsDisplayNameDerived;
            }

            // push to database
            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);
            if (entity.RevisionId != default(int))
                _entities.Update(entity);

            if (command.NoCommit) return;

            _entities.SaveChanges();
        }
    }
}
 