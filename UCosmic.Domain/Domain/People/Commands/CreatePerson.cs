using System;
using System.Threading;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.People
{
    public class CreatePerson
    {
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }

        public int CreatedPersonId { get; internal set; }
        internal Person CreatedPerson { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreatePersonCommand : AbstractValidator<CreatePerson>
    {
        public ValidateCreatePersonCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when first and last name are not provided, display name cannot be empty
            When(x => string.IsNullOrWhiteSpace(x.FirstName) || string.IsNullOrWhiteSpace(x.LastName), () =>
                RuleFor(x => x.DisplayName)
                    // display name cannot be empty
                    .NotEmpty().WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            );
        }
    }

    public class HandleCreatePersonCommand : IHandleCommands<CreatePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreatePersonCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreatePerson command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the person
            var entity = new Person
            {
                DisplayName = command.DisplayName,
                Salutation = command.Salutation,
                FirstName = command.FirstName,
                MiddleName = command.MiddleName,
                LastName = command.LastName,
                Suffix = command.Suffix,
                Gender = command.Gender,
            };

            if (string.IsNullOrWhiteSpace(entity.DisplayName))
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

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.DisplayName,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.Gender,
                }),
                NewState = entity.ToJsonAudit(),
            };
            _entities.Create(audit);

            // store
            _entities.Create(entity);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedPerson = entity;
            command.CreatedPersonId = entity.RevisionId;
        }
    }
}
