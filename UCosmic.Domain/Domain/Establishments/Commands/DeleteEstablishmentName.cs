using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Establishments
{
    public class DeleteEstablishmentName
    {
        public DeleteEstablishmentName(IPrincipal principal, int id)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class ValidateDeleteEstablishmentNameCommand : AbstractValidator<DeleteEstablishmentName>
    {
        public ValidateDeleteEstablishmentNameCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Establishment name id", x => x.Id)

                // id must exist in the database
                .MustFindEstablishmentNameById(entities)
                    .WithMessage(MustFindEstablishmentNameById.FailMessageFormat, x => x.Id)

                // establishment name must not be official
                .MustNotBeOfficialEstablishmentName(entities)
                    .WithMessage(MustNotBeOfficialEstablishmentName.FailMessageFormat, x => x.Id)

                // establishment name cannot be only one
                .MustNotBeOnlyEstablishmentName(entities)
                    .WithMessage(MustNotBeOnlyEstablishmentName.FailMessageFormat, x => x.Id)
            ;
        }
    }

    public class HandleDeleteEstablishmentNameCommand : IHandleCommands<DeleteEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleDeleteEstablishmentNameCommand(ICommandEntities entities, IUnitOfWork unitOfWork, IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(DeleteEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var establishmentName = _entities.Get<EstablishmentName>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage,
                })
                .SingleOrDefault(x => x.RevisionId == command.Id)
            ;
            if (establishmentName == null) return; // delete idempotently

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new { command.Id }),
                PreviousState = establishmentName.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(establishmentName);
            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
