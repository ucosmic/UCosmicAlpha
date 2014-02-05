using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateExternalUrl
    {
        public UpdateExternalUrl(IPrincipal principal, int urlId)
        {
            Principal = principal;
            UrlId = urlId;
        }

        public IPrincipal Principal { get; private set; }
        public int UrlId { get; private set; }
        public string Description { get; set; }
        public string Value { get; set; }
    }

    public class ValidateUpdateExternalUrlCommand : AbstractValidator<UpdateExternalUrl>
    {
        private readonly IProcessQueries _queries;

        public ValidateUpdateExternalUrlCommand(IProcessQueries queries)
        {
            _queries = queries;

            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queries)
            ;

            RuleFor(x => x.UrlId)
                .Must(FindUrlById).WithMessage("Could not find external link with the given id.")
                .Must(BeUrlOwnedByPrincipal).WithMessage("You are not authorized to perform this action for this external link.")
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

        private bool FindUrlById(UpdateExternalUrl command, int urlId)
        {
            var url = _queries.Execute(new ExternalUrlBy(urlId));
            return url != null;
        }

        private bool BeUrlOwnedByPrincipal(UpdateExternalUrl command, int urlId)
        {
            var person = _queries.Execute(new MyPerson(command.Principal)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Urls
                }
            });
            return person.Urls.Select(x => x.Id).Contains(urlId);
        }

        private bool BeHttpFormattedUrl(string value)
        {
            if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || value.StartsWith("https://"))
                if (Uri.IsWellFormedUriString(value, UriKind.Absolute)) return true;
            return false;
        }
    }

    public class HandleUpdateExternalUrlCommand : IHandleCommands<UpdateExternalUrl>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateExternalUrlCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateExternalUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<ExternalUrl>().Single(x => x.Id == command.UrlId);
            entity.Description = command.Description;
            entity.Value = command.Value;
            _entities.SaveChanges();
        }
    }
}
