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
    public class UpdateEstablishmentName
    {
        public UpdateEstablishmentName(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; set; }
        public string Text { get; set; }
        public bool IsOfficialName { get; set; }
        public bool IsFormerName { get; set; }
        public bool IsContextName { get; set; }
        public string LanguageCode { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateEstablishmentNameCommand : AbstractValidator<UpdateEstablishmentName>
    {
        public ValidateUpdateEstablishmentNameCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // id must be within valid range and exist in the database
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Establishment name id", x => x.Id)
                .MustFindEstablishmentNameById(entities)
                    .WithMessage(MustFindEstablishmentNameById.FailMessageFormat, x => x.Id)
            ;

            // text of the establishment name is required, has max length, and must be unique
            RuleFor(x => x.Text)
                .NotEmpty()
                    .WithMessage(MustNotBeEmpty.FailMessageFormat, x => "Establishment name")
                .Length(1, EstablishmentNameConstraints.TextMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Establishment name", x => EstablishmentNameConstraints.TextMaxLength, x => x.Text.Length)
                .MustBeUniqueEstablishmentNameText(entities, x => x.Id)
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

    public class HandleUpdateEstablishmentNameCommand : IHandleCommands<UpdateEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly ITriggerEvent<EstablishmentChanged> _eventTrigger;

        public HandleUpdateEstablishmentNameCommand(ICommandEntities entities
            , ITriggerEvent<EstablishmentChanged> eventTrigger
        )
        {
            _entities = entities;
            _eventTrigger = eventTrigger;
        }

        public void Handle(UpdateEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var establishmentName = _entities.Get<EstablishmentName>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment.Names.Select(y => y.TranslationToLanguage), // parent & siblings
                    x => x.TranslationToLanguage, // language
                })
                .Single(x => x.RevisionId == command.Id);

            // only mutate when state is modified
            if (command.Text == establishmentName.Text &&
                command.IsFormerName == establishmentName.IsFormerName &&
                command.IsOfficialName == establishmentName.IsOfficialName &&
                (!string.IsNullOrWhiteSpace(command.LanguageCode)
                    ? establishmentName.TranslationToLanguage != null &&
                        command.LanguageCode.Equals(establishmentName.TranslationToLanguage.TwoLetterIsoCode)
                    : establishmentName.TranslationToLanguage == null))
                return;

            // update previous official name and owner when changing official name
            if (!establishmentName.IsOfficialName && command.IsOfficialName)
            {
                var establishment = establishmentName.ForEstablishment;
                var officialName = establishment.Names.Single(x => x.IsOfficialName);
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
                Handle(changeCommand);
                establishment.OfficialName = command.Text;
                _entities.Update(establishment);
            }

            // get new language
            var language = _entities.Get<Language>()
                .SingleOrDefault(x => x.TwoLetterIsoCode.Equals(command.LanguageCode, StringComparison.OrdinalIgnoreCase));

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Id,
                    command.Text,
                    command.IsFormerName,
                    command.IsOfficialName,
                    command.LanguageCode,
                }),
                PreviousState = establishmentName.ToJsonAudit(),
            };

            // update scalars
            establishmentName.Text = command.Text;
            establishmentName.IsFormerName = command.IsFormerName;
            establishmentName.IsOfficialName = command.IsOfficialName;
            establishmentName.TranslationToLanguage = language;

            audit.NewState = establishmentName.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(establishmentName);

            if (command.NoCommit) return;
            _entities.SaveChanges();
            _eventTrigger.Raise(new EstablishmentChanged());
        }
    }
}
