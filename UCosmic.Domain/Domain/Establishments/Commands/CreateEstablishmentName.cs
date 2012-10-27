using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Languages;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentName
    {
        public CreateEstablishmentName(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int OwnerId { get; set; }
        public string Text { get; set; }
        public bool IsOfficialName { get; set; }
        public bool IsFormerName { get; set; }
        public string LanguageCode { get; set; }
    }

    public class ValidateCreateEstablishmentNameCommand : AbstractValidator<CreateEstablishmentName>
    {
        private readonly IQueryEntities _entities;
        private Establishment _establishment;

        public ValidateCreateEstablishmentNameCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.OwnerId)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment id '{0}' is not valid.", x => x.OwnerId)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment with id '{0}' does not exist", x => x.OwnerId)
            ;

            // text of the establishment name is required and has max length
            RuleFor(x => x.Text)
                .NotEmpty()
                    .WithMessage("Establishment name is required.")
                .Length(1, 400)
                    .WithMessage("Establishment name cannot exceed 400 characters. You entered {0} character{1}.",
                        name => name.Text.Length,
                        name => name.Text.Length == 1 ? "" : "s")
            ;

            // when the establishment name is official, it cannot be a former / defunct name
            When(x => x.IsOfficialName, () =>
                RuleFor(x => x.IsFormerName).Equal(false)
                .WithMessage("An official establishment name cannot also be a former or defunct name.")
            );
        }

        private bool Exist(int id)
        {
            _establishment = _entities.Query<Establishment>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return _establishment != null;
        }
    }

    public class HandleCreateEstablishmentNameCommand: IHandleCommands<CreateEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateEstablishmentName> _updateHandler;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleCreateEstablishmentNameCommand(ICommandEntities entities
            , IHandleCommands<UpdateEstablishmentName> updateHandler
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _updateHandler = updateHandler;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(CreateEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load owner
            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Names.Select(y => y.TranslationToLanguage),
                })
                .Single(x => x.RevisionId == command.OwnerId)
            ;

            // update previous official name and owner when changing official name
            if (command.IsOfficialName)
            {
                var officialName = establishment.Names.SingleOrDefault(x => x.IsOfficialName);
                if (officialName != null)
                {
                    var changeCommand = new UpdateEstablishmentName(command.Principal)
                    {
                        Id = officialName.RevisionId,
                        Text = officialName.Text,
                        IsFormerName = officialName.IsFormerName,
                        IsOfficialName = false,
                        LanguageCode = (officialName.TranslationToLanguage != null)
                            ? officialName.TranslationToLanguage.TwoLetterIsoCode : null,
                        NoCommit = true,
                    };
                    _updateHandler.Handle(changeCommand);
                }
                establishment.OfficialName = command.Text;
            }

            // get new language
            var language = _entities.Get<Language>()
                .SingleOrDefault(x =>  x.TwoLetterIsoCode.Equals(command.LanguageCode, StringComparison.OrdinalIgnoreCase));

            // create new establishment name
            var establishmentName = new EstablishmentName
            {
                Text = command.Text,
                TranslationToLanguage = language,
                IsOfficialName = command.IsOfficialName,
                IsFormerName = command.IsFormerName,
            };
            establishment.Names.Add(establishmentName);
            establishmentName.ForEstablishment = establishment;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.OwnerId,
                    command.Text,
                    command.IsFormerName,
                    command.IsOfficialName,
                    command.LanguageCode,
                }),
                NewState = establishmentName.ToJsonAudit(),
            };
            _entities.Create(audit);

            _entities.Update(establishment);
            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
