using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityLocation
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public DateTime UpdatedOn { get; protected set; }
        public int PlaceId { get; protected set; }
        public bool NoCommit { get; set; }

        public UpdateActivityLocation(IPrincipal principal, int id, DateTime updatedOn, int placeId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            if (updatedOn == null) { throw new ArgumentNullException("updatedOn"); }

            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
            PlaceId = placeId;
        }
    }

    public class HandleUpdateActivityLocationCommand : IHandleCommands<UpdateActivityLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<DeleteActivityLocation> _deleteActivityLocation;

        public HandleUpdateActivityLocationCommand(ICommandEntities entities,
                                                 IHandleCommands<CreateActivityLocation> createActivityLocation,
                                                 IHandleCommands<DeleteActivityLocation> deleteActivityLocation)
        {
            _entities = entities;
            _createActivityLocation = createActivityLocation;
            _deleteActivityLocation = deleteActivityLocation;
        }

        public class ValidateUpdateActivityLocationCommand : AbstractValidator<UpdateActivityLocation>
        {
            public ValidateUpdateActivityLocationCommand(IQueryEntities entities)
            {
                CascadeMode = CascadeMode.StopOnFirstFailure;

                RuleFor(x => x.Principal)
                    .MustOwnActivityLocation(entities, x => x.Id)
                    .WithMessage(MustOwnActivityLocation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

                RuleFor(x => x.Id)
                    // id must be within valid range
                    .GreaterThanOrEqualTo(1)
                        .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityLocation id", x => x.Id)

                    // id must exist in the database
                    .MustFindActivityLocationById(entities)
                        .WithMessage(MustFindActivityLocationById.FailMessageFormat, x => x.Id)
                ;
            }
        }

        public void Handle(UpdateActivityLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Get the activity values we are updating. */
            var target = _entities.Get<ActivityLocation>().Single(x => x.RevisionId == command.Id);

            target.PlaceId = command.PlaceId;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            if (!command.NoCommit)
            {
                _entities.Update(target);
            }
        }
    }
}

