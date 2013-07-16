using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityDocument
    {
        public UpdateActivityDocument(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }

            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; protected set; }
        public int Id { get; private set; }
        //public DateTime UpdatedOn { get; private set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class HandleUpdateActivityDocumentCommand : IHandleCommands<UpdateActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateActivityDocumentCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
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

            target.Mode = command.Mode;
            target.Title = command.Title;
            target.UpdatedOnUtc = DateTime.UtcNow;
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}

