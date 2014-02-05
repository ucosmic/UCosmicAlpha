using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeleteExternalUrl
    {
        public DeleteExternalUrl(IPrincipal principal, int urlId)
        {
            Principal = principal;
            UrlId = urlId;
        }

        public IPrincipal Principal { get; private set; }
        public int UrlId { get; private set; }
    }

    [UsedImplicitly]
    public class ValidateDeleteExternalUrlCommand : AbstractValidator<DeleteExternalUrl>
    {
        private readonly IProcessQueries _queries;

        public ValidateDeleteExternalUrlCommand(IProcessQueries queries)
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
        }

        private bool FindUrlById(DeleteExternalUrl command, int urlId)
        {
            var url = _queries.Execute(new ExternalUrlBy(urlId));
            return url != null;
        }

        private bool BeUrlOwnedByPrincipal(DeleteExternalUrl command, int urlId)
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
    }

    public class HandleDeleteExternalUrlCommand : IHandleCommands<DeleteExternalUrl>
    {
        private readonly ICommandEntities _entities;

        public HandleDeleteExternalUrlCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(DeleteExternalUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<ExternalUrl>().Single(x => x.Id == command.UrlId);
            _entities.Purge(entity);
            _entities.SaveChanges();
        }
    }
}
