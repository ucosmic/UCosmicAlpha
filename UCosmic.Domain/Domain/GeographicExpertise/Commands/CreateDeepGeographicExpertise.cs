using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.GeographicExpertise
{
    public class CreateDeepGeographicExpertise
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; private set; }
        public ICollection<int> PlaceIds { get; private set; }
        public string Description { get; set; }
        public int CreatedGeographicExpertiseId { get; internal set; }
        internal bool NoCommit { get; set; }
        internal GeographicExpertise CreatedGeographicExpertise { get; set; }

        public CreateDeepGeographicExpertise(IPrincipal principal, ICollection<int> placeIds)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if ((placeIds == null) || (placeIds.Count == 0)) throw new ArgumentNullException("placeIds");
            Principal = principal;
            PlaceIds = placeIds;
        }
    }

    public class ValidateCreateDeepGeographicExpertiseCommand : AbstractValidator<CreateDeepGeographicExpertise>
    {
        public ValidateCreateDeepGeographicExpertiseCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateDeepGeographicExpertiseCommand : IHandleCommands<CreateDeepGeographicExpertise>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateGeographicExpertise> _createGeographicExpertise;
        private readonly IHandleCommands<CreateGeographicExpertiseLocation> _createGeographicExpertiseLocation;

        public HandleCreateDeepGeographicExpertiseCommand(ICommandEntities entities,
                                                          IUnitOfWork unitOfWork,
                                                          IHandleCommands<CreateGeographicExpertise> createGeographicExpertise,
                                                          IHandleCommands<CreateGeographicExpertiseLocation> createGeographicExpertiseLocation)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createGeographicExpertise = createGeographicExpertise;
            _createGeographicExpertiseLocation = createGeographicExpertiseLocation;
        }

        public void Handle(CreateDeepGeographicExpertise command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            var createExpertiseCommand = new CreateGeographicExpertise(command.Principal)
            {
                Description = command.Description
            };

            _createGeographicExpertise.Handle(createExpertiseCommand);

            foreach (var placeId in command.PlaceIds)
            {
                var createExpertiseLocationCommand = new CreateGeographicExpertiseLocation(
                    command.Principal,
                    createExpertiseCommand.CreatedGeographicExpertise.RevisionId,
                    placeId);

                _createGeographicExpertiseLocation.Handle(createExpertiseLocationCommand);
            }

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedGeographicExpertise = createExpertiseCommand.CreatedGeographicExpertise;
            command.CreatedGeographicExpertiseId = command.CreatedGeographicExpertise.RevisionId;
        }
    }
}
