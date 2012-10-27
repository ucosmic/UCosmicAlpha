using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.Languages;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentName
    {
        public int ForEstablishmentId { get; set; }
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

            RuleFor(x => x.ForEstablishmentId)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment id '{0}' is not valid.", x => x.ForEstablishmentId)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment with id '{0}' does not exist", x => x.ForEstablishmentId)
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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleCreateEstablishmentNameCommand(ICommandEntities entities, IUnitOfWork unitOfWork, IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(CreateEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load parent
            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Names,
                })
                .Single(x => x.RevisionId == command.ForEstablishmentId)
            ;

            // get new language
            var language = _entities.Get<Language>()
                .SingleOrDefault(x =>  x.TwoLetterIsoCode.Equals(command.LanguageCode, StringComparison.OrdinalIgnoreCase));

            var establishmentName = new EstablishmentName
            {
                Text = command.Text,
                TranslationToLanguage = language,
                IsOfficialName = command.IsOfficialName,
                IsFormerName = command.IsFormerName,
            };

            if (command.IsOfficialName)
            {
                foreach (var name in establishment.Names)
                {
                    name.IsOfficialName = false;
                    _entities.Update(name);
                }
                establishment.OfficialName = command.Text;
                establishmentName.IsFormerName = false; // official name cannot be defunct
            }

            establishment.Names.Add(establishmentName);
            _entities.Update(establishment);
            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
