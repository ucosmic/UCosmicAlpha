using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public IPrincipal Principal { get; protected set; }
        public string ModeText { get; protected set; }
        public Guid? EntityId { get; set; }
        public int? EditSourceId { get; set; }
        public Activity CreatedActivity { get; internal set; }
        public bool NoCommit { get; set; }

        public CreateMyNewActivity(IPrincipal principal, string modeText)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (modeText == null) throw new ArgumentNullException("modeText");
            Principal = principal;
            ModeText = modeText;
        }
    }

    public class ValidateCreateMyNewActivityCommand : AbstractValidator<CreateMyNewActivity>
    {
        public ValidateCreateMyNewActivityCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateMyNewActivityCommand : IHandleCommands<CreateMyNewActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateMyNewActivityCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateMyNewActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            //var otherActivities = _entities.Get<Activity>()
            //                                   .SingleOrDefault(x => (x.PersonId == person.RevisionId)
            //                                   && (x.ModeText == command.ModeText));
            Activity otherActivities = null;

            var activity = new Activity
            {
                PersonId = person.RevisionId,
                Number = (otherActivities != null) ? otherActivities.Number : 0,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                EditSourceId = command.EditSourceId,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                activity.EntityId = command.EntityId.Value;
            }

            _entities.Create(activity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedActivity = activity;
        }
    }
}
