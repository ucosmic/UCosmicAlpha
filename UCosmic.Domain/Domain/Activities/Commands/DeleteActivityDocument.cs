using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class DeleteActivityDocument
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }

        public DeleteActivityDocument(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteActivityDocumentCommand : AbstractValidator<DeleteActivityDocument>
    {
        public ValidateDeleteActivityDocumentCommand(IQueryEntities entities)
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
        }
    }

    public class HandleDeleteActivityDocumentCommand : IHandleCommands<DeleteActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleDeleteActivityDocumentCommand(ICommandEntities entities, IUnitOfWork unitOfWork, IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(DeleteActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var activityDocument = _entities.Get<ActivityDocument>()
                .SingleOrDefault(x => x.RevisionId == command.Id)
            ;
            if (activityDocument == null) return; // delete idempotently

            if (activityDocument.ImageId.HasValue && (activityDocument.ImageId.Value != 0))
            {
                var image = _entities.Get<UCosmic.Domain.Files.Image>()
                                     .SingleOrDefault(x => x.Id == activityDocument.ImageId.Value);
                _entities.Purge(image);
            }

            if (activityDocument.FileId.HasValue && (activityDocument.FileId.Value != 0))
            {
                var loadableFile = _entities.Get<LoadableFile>()
                                     .SingleOrDefault(x => x.Id == activityDocument.FileId.Value);
                _entities.Purge(loadableFile);                
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
            _entities.Purge(activityDocument);
            _unitOfWork.SaveChanges();
            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
