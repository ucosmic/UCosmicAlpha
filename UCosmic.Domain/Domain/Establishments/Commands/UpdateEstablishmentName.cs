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
        public string LanguageCode { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateEstablishmentNameCommand : AbstractValidator<UpdateEstablishmentName>
    {
        private readonly IQueryEntities _entities;
        private EstablishmentName _establishmentName;
        private EstablishmentName _duplicate;

        public ValidateUpdateEstablishmentNameCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment name id '{0}' is not valid.", x => x.Id)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment name with id '{0}' does not exist", x => x.Id)
            ;

            // text of the establishment name is required and has max length
            RuleFor(x => x.Text)
                .NotEmpty()
                    .WithMessage("Establishment name is required.")
                .Length(1, 400)
                    .WithMessage("Establishment name cannot exceed 400 characters. You entered {0} character{1}.",
                        name => name.Text.Length,
                        name => name.Text.Length == 1 ? "" : "s")
                .Must(NotBeDuplicate)
                    .WithMessage("The establishment name '{0}' already exists.", x => _duplicate.Text)
            ;

            // when the establishment name is official, it cannot be a former / defunct name
            When(x => x.IsOfficialName, () =>
                RuleFor(x => x.IsFormerName).Equal(false)
                .WithMessage("An official establishment name cannot also be a former or defunct name.")
            );
        }

        private bool Exist(int id)
        {
            _establishmentName = _entities.Query<EstablishmentName>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return _establishmentName != null;
        }

        private bool NotBeDuplicate(UpdateEstablishmentName command, string text)
        {
            _duplicate =
                _entities.Query<EstablishmentName>().FirstOrDefault(
                    x =>
                    x.RevisionId != command.Id &&
                    (x.Text.Equals(text, StringComparison.OrdinalIgnoreCase) ||
                    (x.AsciiEquivalent != null && x.AsciiEquivalent.Equals(text, StringComparison.OrdinalIgnoreCase))));
            return _duplicate == null;
        }
    }

    public class HandleUpdateEstablishmentNameCommand : IHandleCommands<UpdateEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleUpdateEstablishmentNameCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
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

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
                _eventProcessor.Raise(new EstablishmentChanged());
            }
        }
    }
}
