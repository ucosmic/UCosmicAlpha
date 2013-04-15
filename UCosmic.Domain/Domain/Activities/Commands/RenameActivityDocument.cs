using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class RenameActivityDocument
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        public string Title { get; private set; }

        public RenameActivityDocument(IPrincipal principal, int id, string title)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            Title = title;
        }
    }

    public class ValidateRenameActivityDocumentCommand : AbstractValidator<RenameActivityDocument>
    {
        public ValidateRenameActivityDocumentCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivityDocument(entities, x => x.Id)
                .WithMessage(MustOwnActivityDocument<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityDocument id", x => x.Id)

                // id must exist in the database
                .MustFindActivityDocumentById(entities)
                    .WithMessage(MustFindActivityDocumentById.FailMessageFormat, x => x.Id)
            ;

            RuleFor(x => x.Title)
                .NotEmpty()
                    .WithMessage(MustNotBeEmpty.FailMessageFormat, x => "Document title")
                .Length(1, ActivityDocumentConstraints.MaxTitleLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Document title", x => ActivityDocumentConstraints.MaxTitleLength, x => x.Title.Length);
        }
    }

    public class HandleRenameActivityDocumentCommand : IHandleCommands<RenameActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IProcessEvents _eventProcessor;

        public HandleRenameActivityDocumentCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            //, IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            //_eventProcessor = eventProcessor;
        }

        public void Handle(RenameActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var activityDocument = _entities.Get<ActivityDocument>()
                .SingleOrDefault(x => x.RevisionId == command.Id)
            ;
            if (activityDocument == null) return;

            activityDocument.Title = command.Title;

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
            _unitOfWork.SaveChanges();
            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
