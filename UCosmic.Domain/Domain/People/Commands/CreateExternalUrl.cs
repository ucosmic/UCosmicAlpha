using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class CreateExternalUrl
    {
        public CreateExternalUrl(IPrincipal principal, int personId)
        {
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int PersonId { get; private set; }
        public string Description { get; set; }
        public string Value { get; set; }
        public ExternalUrl Created { get; internal set; }
    }

    public class ValidateCreateExternalUrlCommand : AbstractValidator<CreateExternalUrl>
    {
        private readonly IProcessQueries _queries;

        public ValidateCreateExternalUrlCommand(IProcessQueries queries)
        {
            _queries = queries;

            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queries)
                .Must(BePersonWithId).WithMessage("You are not authorized to perform this action for this person.")
            ;

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Link description is required.")
                .Length(1, ExternalUrl.Constraints.DescriptionMaxLength)
                    .WithMessage("Link description cannot contain more than {0} characters, you entered {1}.",
                        x => ExternalUrl.Constraints.DescriptionMaxLength, x => x.Description.Length)
            ;

            RuleFor(x => x.Value)
                .NotEmpty().WithMessage("Link URL is required.")
                .Length(1, ExternalUrl.Constraints.ValueMaxLength)
                    .WithMessage("Link URL cannot contain more than {0} characters, you entered {1}.",
                        x => ExternalUrl.Constraints.ValueMaxLength, x => x.Value.Length)
                .Must(BeHttpFormattedUrl).WithMessage("This is not a valid link / URL.")
            ;
        }

        private bool BePersonWithId(CreateExternalUrl command, IPrincipal principal)
        {
            var person = _queries.Execute(new MyPerson(principal));
            return person.RevisionId == command.PersonId;
        }

        private bool BeHttpFormattedUrl(string value)
        {
            if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || value.StartsWith("https://"))
                if (Uri.IsWellFormedUriString(value, UriKind.Absolute)) return true;
            return false;
        }
    }

    public class HandleCreateExternalUrlCommand : IHandleCommands<CreateExternalUrl>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateExternalUrlCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateExternalUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new ExternalUrl
            {
                PersonId = command.PersonId,
                Description = command.Description,
                Value = command.Value,
            };
            _entities.Create(entity);
            _entities.SaveChanges();
            command.Created = entity;
        }
    }
}
