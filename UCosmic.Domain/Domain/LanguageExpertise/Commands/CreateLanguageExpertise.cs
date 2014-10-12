using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.LanguageExpertises
{
    public class CreateLanguageExpertise
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; private set; }
        public int? LanguageId { get; set; }
        public string Other { get; set; }
        public string Dialect { get; set; }
        public int SpeakingProficiency { get; private set; }
        public int ListeningProficiency { get; private set; }
        public int ReadingProficiency { get; private set; }
        public int WritingProficiency { get; private set; }
        public int CreatedLanguageExpertiseId { get; internal set; }
        internal LanguageExpertise CreatedLanguageExpertise { get; set; }
        internal bool NoCommit { get; set; }

        public CreateLanguageExpertise( IPrincipal principal,
                                        int speakingProficiency,
                                        int listeningProficiency,
                                        int readingProficiency,
                                        int writingProficiency )
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            SpeakingProficiency = speakingProficiency;
            ListeningProficiency = listeningProficiency;
            ReadingProficiency = readingProficiency;
            WritingProficiency = writingProficiency;
        }
    }

    public class ValidateCreateLanguageExpertiseCommand : AbstractValidator<CreateLanguageExpertise>
    {
        public ValidateCreateLanguageExpertiseCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateLanguageExpertiseCommand : IHandleCommands<CreateLanguageExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateLanguageExpertiseCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateLanguageExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            var expertise = new LanguageExpertise
            {
                PersonId = person.RevisionId,
                LanguageId = command.LanguageId,
                SpeakingProficiency = command.SpeakingProficiency,
                ListeningProficiency = command.ListeningProficiency,
                ReadingProficiency = command.ReadingProficiency,
                WritingProficiency = command.WritingProficiency,
                Dialect = command.Dialect,
                Other = command.Other,
                
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                expertise.EntityId = command.EntityId.Value;
            }

            _entities.Create(expertise);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedLanguageExpertise = expertise;
            command.CreatedLanguageExpertiseId = command.CreatedLanguageExpertise.RevisionId;
        }
    }
}
