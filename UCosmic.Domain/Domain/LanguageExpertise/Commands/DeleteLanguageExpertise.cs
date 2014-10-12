using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.LanguageExpertises
{
    public class DeleteLanguageExpertise
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        internal bool NoCommit { get; set; }

        public DeleteLanguageExpertise(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteLanguageExpertiseCommand : AbstractValidator<DeleteLanguageExpertise>
    {
        public ValidateDeleteLanguageExpertiseCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnLanguageExpertise(entities, x => x.Id)
                    .WithMessage(MustOwnLanguageExpertise<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "LanguageExpertise id", x => x.Id)
            ;
        }
    }

    public class HandleDeleteLanguageExpertiseCommand : IHandleCommands<DeleteLanguageExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IProcessEvents _eventProcessor;

        public HandleDeleteLanguageExpertiseCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            //, IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            //_eventProcessor = eventProcessor;
        }

        public void Handle(DeleteLanguageExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<LanguageExpertise>().SingleOrDefault(x => x.RevisionId == command.Id);
            if (activity == null) return;

            _entities.Purge(activity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            // TBD
            // log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = User.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new { command.Id }),
            //    PreviousState = activityDocument.ToJsonAudit(),
            //};
            //_entities.Create(audit);

            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
