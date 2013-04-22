using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityDocument
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public DateTime UpdatedOn { get; protected set; }
        public int? FileId { get; set; }
        public int? ImageId { get; set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public bool Visible { get; set; }
        public bool NoCommit { get; set; }

        public UpdateActivityDocument(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            if (updatedOn == null) { throw new ArgumentNullException("updatedOn"); }

            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn.ToUniversalTime();
        }
    }

    public class HandleUpdateActivityDocumentCommand : IHandleCommands<UpdateActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<DeleteActivityLocation> _deleteActivityLocation;

        public HandleUpdateActivityDocumentCommand(ICommandEntities entities,
                                                 IHandleCommands<CreateActivityLocation> createActivityLocation,
                                                 IHandleCommands<DeleteActivityLocation> deleteActivityLocation)
        {
            _entities = entities;
            _createActivityLocation = createActivityLocation;
            _deleteActivityLocation = deleteActivityLocation;
        }

        public class ValidateUpdateActivityDocumentCommand : AbstractValidator<UpdateActivityDocument>
        {
            public ValidateUpdateActivityDocumentCommand(IQueryEntities entities)
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

        public void Handle(UpdateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Get the activity values we are updating. */
            var target = _entities.Get<ActivityDocument>().Single(x => x.RevisionId == command.Id);

            target.FileId = command.FileId;
            target.ImageId = command.ImageId;
            target.Mode = command.Mode;
            target.Title = command.Title;
            target.Visible = command.Visible;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            if (!command.NoCommit)
            {
                _entities.Update(target);
            }
        }
    }
}

