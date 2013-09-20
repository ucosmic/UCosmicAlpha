using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.LanguageExpertise
{
    public class UpdateLanguageExpertise
    {
        public IPrincipal Principal { get; set; }
        public int Id { get; protected set; }
        public int? LanguageId { get; protected set; }
        public string Other { get; set; }
        public string Dialect { get; set; }
        public int SpeakingProficiency { get; protected set; }
        public int ListeningProficiency { get; protected set; }
        public int ReadingProficiency { get; protected set; }
        public int WritingProficiency { get; protected set; }
        public DateTime UpdatedOn { get; set; }
        internal bool NoCommit { get; set; }

        public UpdateLanguageExpertise()
        {
        }

        public UpdateLanguageExpertise(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateLanguageExpertiseCommand : AbstractValidator<UpdateLanguageExpertise>
    {
        public ValidateUpdateLanguageExpertiseCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnLanguageExpertise(entities, x => x.Id)
                .WithMessage(MustOwnLanguageExpertise<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "LanguageExpertise id", x => x.Id)

                // id must exist in the database
                .MustFindLanguageExpertiseById(entities)
                .WithMessage(MustFindLanguageExpertiseById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyLanguageExpertiseCommand : IHandleCommands<UpdateLanguageExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateMyLanguageExpertiseCommand(  ICommandEntities entities,
                                                        IUnitOfWork unitOfWork )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateLanguageExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the expertise to update. */
            var target = _entities.Get<LanguageExpertise>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (target == null)
            {
                string message = String.Format("LanguageExpertise Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            /* Update fields */
            target.LanguageId = command.LanguageId;
            target.Other = command.Other;
            target.Dialect = command.Dialect;
            target.SpeakingProficiency = command.SpeakingProficiency;
            target.ListeningProficiency = command.ListeningProficiency;
            target.ReadingProficiency = command.ReadingProficiency;
            target.WritingProficiency = command.WritingProficiency;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
