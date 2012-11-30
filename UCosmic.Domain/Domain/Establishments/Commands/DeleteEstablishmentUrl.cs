using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Establishments
{
    public class DeleteEstablishmentUrl
    {
        public DeleteEstablishmentUrl(IPrincipal principal, int id)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class ValidateDeleteEstablishmentUrlCommand : AbstractValidator<DeleteEstablishmentUrl>
    {
        private readonly IQueryEntities _entities;
        private EstablishmentUrl _establishmentUrl;

        public ValidateDeleteEstablishmentUrlCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment URL id '{0}' is not valid.", x => x.Id)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment URL with id '{0}' does not exist", x => x.Id)
            ;

            When(x => _establishmentUrl != null,() =>
                RuleFor(x => x.Id)
                    // establishment URL must not be official
                    .Must(NotBeOfficial)
                    .WithMessage("Establishment URL with id '{0}' cannot be deleted because it is the official URL.", x => x.Id)

                    // establishment URL cannot be only one
                    .Must(HaveSiblings)
                    .WithMessage("Establishment URL with id '{0}' cannot be deleted because it is the only URL.", x => x.Id)
            );
        }

        private bool Exist(int id)
        {
            _establishmentUrl = _entities.Query<EstablishmentUrl>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return true;
        }

        private bool NotBeOfficial(int id)
        {
            return !_establishmentUrl.IsOfficialUrl;
        }

        private bool HaveSiblings(int id)
        {
            var siblings = _entities.Query<EstablishmentUrl>()
                .Where(x => x.ForEstablishment.RevisionId == _establishmentUrl.ForEstablishment.RevisionId);
            return siblings.Count() > 1;
        }
    }

    public class HandleDeleteEstablishmentUrlCommand : IHandleCommands<DeleteEstablishmentUrl>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleDeleteEstablishmentUrlCommand(ICommandEntities entities, IUnitOfWork unitOfWork, IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(DeleteEstablishmentUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var establishmentUrl = _entities.Get<EstablishmentUrl>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentUrl, object>>[]
                {
                    x => x.ForEstablishment,
                })
                .SingleOrDefault(x => x.RevisionId == command.Id)
            ;
            if (establishmentUrl == null) return; // delete idempotently

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new { command.Id }),
                PreviousState = establishmentUrl.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(establishmentUrl);
            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
