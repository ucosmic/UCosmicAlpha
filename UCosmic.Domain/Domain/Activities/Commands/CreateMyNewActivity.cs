using System;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public User User { get; protected set; }
        public string ModeText { get; protected set; }
        public Guid? EntityId { get; set; }
        public int? EditSourceId { get; set; }
        public Activity CreatedActivity { get; internal set; }
        public bool NoCommit { get; set; }

        public CreateMyNewActivity(User user, string modeText)
        {
            if (user == null) throw new ArgumentNullException("user");
            if (modeText == null) throw new ArgumentNullException("modeText");
            User = user;
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

            var person = _entities.Get<Person>().Single(p => p.RevisionId == command.User.Person.RevisionId);
            if (person == null)
            {
                var message = string.Format("Person Id {0} does not exist.", command.User.Person.RevisionId);
                throw new Exception(message);
            }

            var otherActivities = _entities.Get<Activity>()
                                           .WithPersonId(person.RevisionId)
                                           .WithMode(command.ModeText);

            var activity = new Activity
            {
                PersonId = person.RevisionId,
                Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                EditSourceId = command.EditSourceId,

                CreatedByPrincipal = person.DisplayName,
                UpdatedByPrincipal = person.DisplayName,
                UpdatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId != null)
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
