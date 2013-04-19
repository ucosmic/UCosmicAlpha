using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class DeleteActivityLocation
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }
        public bool NoCommit { get; set; }

        public DeleteActivityLocation(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteActivityLocationCommand : AbstractValidator<DeleteActivityLocation>
    {
        public ValidateDeleteActivityLocationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivityDocument(entities, x => x.Id)
                .WithMessage(MustOwnActivityLocation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityLocation id", x => x.Id)

                // id must exist in the database
                .MustFindActivityDocumentById(entities)
                    .WithMessage(MustFindActivityLocationById.FailMessageFormat, x => x.Id)
            ;
        }
    }

    public class HandleDeleteActivityLocationCommand : IHandleCommands<DeleteActivityLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteActivityLocationCommand(ICommandEntities entities, IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteActivityLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityLocation = _entities.Get<ActivityLocation>().SingleOrDefault(x => x.RevisionId == command.Id);
            if (activityLocation == null) return;

            _entities.Purge(activityLocation);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
