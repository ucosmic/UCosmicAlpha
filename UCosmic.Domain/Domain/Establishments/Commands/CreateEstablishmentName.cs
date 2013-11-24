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
        public int Id { get; internal set; }
        public int? OwnerId { get; set; }
        internal Establishment Owner { get; set; }
        public string Text { get; set; }
        public bool IsOfficialName { get; set; }
        public bool IsFormerName { get; set; }
        public bool IsContextName { get; set; }
        public string LanguageCode { get; set; }

        internal bool NoCommit { get; set; }
        internal EstablishmentName CreatedEntity { get; set; }
    }

    public class ValidateCreateEstablishmentNameCommand : AbstractValidator<CreateEstablishmentName>
    {
        public ValidateCreateEstablishmentNameCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            When(x => x.Owner == null, () =>
                RuleFor(x => x.OwnerId.HasValue).Equal(true).WithMessage("Establishment Name owner id must be provided.")
            );

            // owner id must exist in the database when in valid range
            When(x => x.OwnerId.HasValue, () =>
                RuleFor(x => x.OwnerId.Value)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.OwnerId)
            );

            // text of the establishment name is required, has max length, and must be unique
            RuleFor(x => x.Text)
                .NotEmpty()
                    .WithMessage(MustNotBeEmpty.FailMessageFormat, x => "Establishment name")
                .Length(1, EstablishmentNameConstraints.TextMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Establishment name", x => EstablishmentNameConstraints.TextMaxLength, x => x.Text.Length)
                .MustBeUniqueEstablishmentNameText(entities)
                    .Unless(x => x.IsContextName, ApplyConditionTo.CurrentValidator)
                    .WithMessage(MustBeUniqueEstablishmentNameText<object>.FailMessageFormat, x => x.Text)
            ;

            // when the establishment name is official, it cannot be a former / defunct name
            When(x => x.IsOfficialName, () =>
                RuleFor(x => x.IsFormerName).Equal(false)
                    .WithMessage(MustNotBeFormerEstablishmentNameWhenIsOfficial.FailMessage)
            );
        }
    }

    public class HandleCreateEstablishmentNameCommand: IHandleCommands<CreateEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateEstablishmentName> _updateHandler;
        private readonly ITriggerEvent<EstablishmentChanged> _eventTrigger;

        public HandleCreateEstablishmentNameCommand(ICommandEntities entities
            , IHandleCommands<UpdateEstablishmentName> updateHandler
            , ITriggerEvent<EstablishmentChanged> eventTrigger
        )
        {
            _entities = entities;
            _updateHandler = updateHandler;
            _eventTrigger = eventTrigger;
        }

        public void Handle(CreateEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load owner
            var establishment = command.Owner ?? _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Names.Select(y => y.TranslationToLanguage),
                })
                .Single(x => x.RevisionId == command.OwnerId.Value)
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
                IsContextName = command.IsContextName,
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
                    OwnerId = command.Owner != null ? command.Owner.RevisionId : command.OwnerId,
                    command.Text,
                    command.IsFormerName,
                    command.IsOfficialName,
                    command.IsContextName,
                    command.LanguageCode,
                }),
                NewState = establishmentName.ToJsonAudit(),
            };

            _entities.Create(audit);
            if (establishment.RevisionId != default(int))
                _entities.Update(establishment);
            command.CreatedEntity = establishmentName;
            if (command.NoCommit) return;

            _entities.SaveChanges();
            command.Id = establishmentName.RevisionId;
            _eventTrigger.Raise(new EstablishmentChanged());
        }
    }
}
