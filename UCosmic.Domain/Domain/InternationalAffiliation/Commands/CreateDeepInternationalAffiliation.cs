using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.InternationalAffiliations
{
    public class CreateDeepInternationalAffiliation
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }
        public ICollection<int> PlaceIds { get; protected set; }
        public DateTime From { get; set; }
        public DateTime? To { get; set; }
        public bool OnGoing { get; set; }
        public string Institution { get; set; }
        public string Position { get; set; }
        public bool NoCommit { get; set; }
        public InternationalAffiliation CreatedInternationalAffiliation { get; protected internal set; }

        public CreateDeepInternationalAffiliation(IPrincipal principal, ICollection<int> placeIds)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if ((placeIds == null) || (placeIds.Count == 0)) throw new ArgumentNullException("placeIds");
            Principal = principal;
            PlaceIds = placeIds;
        }
    }

    public class ValidateCreateDeepInternationalAffiliationCommand : AbstractValidator<CreateDeepInternationalAffiliation>
    {
        public ValidateCreateDeepInternationalAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateDeepInternationalAffiliationCommand : IHandleCommands<CreateDeepInternationalAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateInternationalAffiliation> _createInternationalAffiliation;
        private readonly IHandleCommands<CreateInternationalAffiliationLocation> _createInternationalAffiliationLocation;

        public HandleCreateDeepInternationalAffiliationCommand(ICommandEntities entities,
                                                          IUnitOfWork unitOfWork,
                                                          IHandleCommands<CreateInternationalAffiliation> createInternationalAffiliation,
                                                          IHandleCommands<CreateInternationalAffiliationLocation> createInternationalAffiliationLocation)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createInternationalAffiliation = createInternationalAffiliation;
            _createInternationalAffiliationLocation = createInternationalAffiliationLocation;
        }

        public void Handle(CreateDeepInternationalAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            var createExpertiseCommand = new CreateInternationalAffiliation(command.Principal)
            {
                From = command.From,
                To = command.To,
                OnGoing = command.OnGoing,
                Institution = command.Institution,
                Position = command.Position
            };

            _createInternationalAffiliation.Handle(createExpertiseCommand);

            foreach (var placeId in command.PlaceIds)
            {
                var createExpertiseLocationCommand = new CreateInternationalAffiliationLocation(
                    command.Principal,
                    createExpertiseCommand.CreatedInternationalAffiliation.RevisionId,
                    placeId);

                _createInternationalAffiliationLocation.Handle(createExpertiseLocationCommand);
            }

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedInternationalAffiliation = createExpertiseCommand.CreatedInternationalAffiliation;
        }
    }
}
