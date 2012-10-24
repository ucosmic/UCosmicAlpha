using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Languages;

namespace UCosmic.Domain.Establishments
{
    public class UpdateEstablishmentName
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool IsOfficialName { get; set; }
        public bool IsFormerName { get; set; }
        public string LanguageCode { get; set; }
    }

    public class HandleUpdateEstablishmentNameCommand: IHandleCommands<UpdateEstablishmentName>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleUpdateEstablishmentNameCommand(ICommandEntities entities, IUnitOfWork unitOfWork, IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(UpdateEstablishmentName command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<EstablishmentName>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment.Names,
                    x => x.TranslationToLanguage,
                })
                .SingleOrDefault(x => x.RevisionId == command.Id);
            if (entity == null) throw new InvalidOperationException(string.Format(
                "Unable to find entity with primary key {0}.", command.Id));

            var language = _entities.Get<Language>()
                .SingleOrDefault(x =>  x.TwoLetterIsoCode.Equals(command.LanguageCode, StringComparison.OrdinalIgnoreCase));

            // can only be one official name
            if (command.IsOfficialName && !entity.IsOfficialName)
            {
                foreach (var name in entity.ForEstablishment.Names)
                {
                    name.IsOfficialName = false;
                    _entities.Update(name);
                }
                entity.ForEstablishment.OfficialName = command.Text;
                _entities.Update(entity.ForEstablishment);
            }

            entity.Text = command.Text;
            entity.IsFormerName = command.IsFormerName;
            entity.IsOfficialName = command.IsOfficialName;
            entity.TranslationToLanguage = language;

            _entities.Update(entity);
            _unitOfWork.SaveChanges();
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
