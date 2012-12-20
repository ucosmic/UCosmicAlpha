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
        public ValidateDeleteEstablishmentUrlCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(PrimaryKeyMustBeGreaterThanZero.FailMessageFormat, x => "Establishment URL id", x => x.Id)

                // id must exist in the database
                .MustExistAsEstablishmentUrl(entities)
                    .WithMessage(EstablishmentUrlIdMustExist.FailMessageFormat, x => x.Id)

                // establishment URL must not be official
                .MustNotBeOfficialEstablishmentUrl(entities)
                    .WithMessage(MustNotBeOfficialEstablishmentUrl.FailMessageFormat, x => x.Id)

                .MustNotBeOnlyEstablishmentUrl(entities)
                    .WithMessage(MustNotBeOnlyEstablishmentUrl.FailMessageFormat, x => x.Id)
            ;
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
