using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityAndValues
    {
        public CreateActivityAndValues(IPrincipal principal, ActivityMode mode)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Mode = mode;
        }

        public IPrincipal Principal { get; private set; }
        public ActivityMode Mode { get; private set; }
        public Activity CreatedActivity { get; internal set; }
    }

    public class ValidateCreateActivityAndValuesCommand : AbstractValidator<CreateActivityAndValues>
    {
        public ValidateCreateActivityAndValuesCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
            ;
        }
    }

    public class HandleCreateActivityAndValuesCommand : IHandleCommands<CreateActivityAndValues>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateActivity> _createActivity;
        private readonly IHandleCommands<CreateActivityValues> _createValues;

        public HandleCreateActivityAndValuesCommand(IUnitOfWork unitOfWork
            , IHandleCommands<CreateActivity> createActivity
            , IHandleCommands<CreateActivityValues> createValues
        )
        {
            _unitOfWork = unitOfWork;
            _createActivity = createActivity;
            _createValues = createValues;
        }

        public void Handle(CreateActivityAndValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // create activity entity
            var createActivity = new CreateActivity(command.Principal)
            {
                Mode = command.Mode,
                NoCommit = true,
            };
            _createActivity.Handle(createActivity);

            // create values entity
            var createValues = new CreateActivityValues(command.Principal)
            {
                NoCommit = true,
                Activity = createActivity.CreatedActivity,
                Mode = createActivity.CreatedActivity.Mode,
            };
            _createValues.Handle(createValues);

            // pass back created activity
            command.CreatedActivity = createActivity.CreatedActivity;

            _unitOfWork.SaveChanges();
        }
    }
}
