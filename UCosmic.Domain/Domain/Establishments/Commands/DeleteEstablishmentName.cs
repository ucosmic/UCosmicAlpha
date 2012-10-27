using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
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

        public int Id { get; private set; }
        public IPrincipal Principal { get; private set; }
    }

    public class ValidateDeleteEstablishmentNameCommand : AbstractValidator<DeleteEstablishmentName>
    {
        private readonly IQueryEntities _entities;
        private EstablishmentName _establishmentName;

        public ValidateDeleteEstablishmentNameCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment name id '{0}' is not valid.", x => x.Id)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment name with id '{0}' does not exist", x => x.Id)

                // establishment name must not be official
                .Must(NotBeOfficial)
                .WithMessage("Establishment name with id '{0}' cannot be deleted because it is the official name.", x => x.Id)

                // establishment name cannot be only one
                .Must(HaveSiblings)
                .WithMessage("Establishment name with id '{0}' cannot be deleted because it is the only name.", x => x.Id)
            ;
        }

        private bool Exist(int id)
        {
            _establishmentName = _entities.Query<EstablishmentName>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return _establishmentName != null;
        }

        private bool NotBeOfficial(int id)
        {
            return !_establishmentName.IsOfficialName;
        }

        private bool HaveSiblings(int id)
        {
            var siblings = _entities.Query<EstablishmentName>()
                .Where(x => x.ForEstablishment.RevisionId == _establishmentName.ForEstablishment.RevisionId);
            return siblings.Count() > 1;
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

            var entity = _entities.Get<EstablishmentName>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage,
                })
                .Single(x => x.RevisionId == command.Id)
            ;

            var previousState = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                ForEstablishmentId = entity.ForEstablishment.RevisionId,
                TranslationToLanguageId = entity.TranslationToLanguage.Id,
                entity.Text,
                entity.IsOfficialName,
                entity.IsFormerName,
            });
            var audit = new Deletion
            {
                CommandedBy = command.Principal.Identity.Name,
                CommandName = command.GetType().FullName,
                PreviousState = previousState,
            };
            _entities.Create(audit);

            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
