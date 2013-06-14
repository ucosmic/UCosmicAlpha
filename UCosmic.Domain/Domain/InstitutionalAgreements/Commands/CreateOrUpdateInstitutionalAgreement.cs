using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class CreateOrUpdateInstitutionalAgreement
    {
        public CreateOrUpdateInstitutionalAgreement(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsTitleDerived { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public bool? IsAutoRenew { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime ExpiresOn { get; set; }
        public bool IsExpirationEstimated { get; set; }
        public InstitutionalAgreementVisibility Visibility { get; set; }
        public int? UmbrellaId { get; set; }
        public IEnumerable<int> RemoveParticipantEstablishmentIds { get; set; }
        public IEnumerable<int> AddParticipantEstablishmentIds { get; set; }
        public IEnumerable<int> RemoveContactIds { get; set; }
        public IEnumerable<AddContactToAgreement> AddContactCommands { get; set; }
        public IEnumerable<Guid> DetachFileEntityIds { get; set; }
        public IEnumerable<Guid> AttachFileEntityIds { get; set; }
        public int ChangeCount { get; internal set; }
        //public Guid EntityId { get; internal set; }
    }

    public class HandleCreateOrUpdateInstitutionalAgreementCommand : IHandleCommands<CreateOrUpdateInstitutionalAgreement>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<RemoveParticipantFromAgreement> _participantRemover;
        private readonly IHandleCommands<AddParticipantToAgreement> _participantAdder;
        private readonly IHandleCommands<RemoveContactFromAgreement> _contactRemover;
        private readonly IHandleCommands<AddContactToAgreement> _contactAdder;
        private readonly IHandleCommands<DetachFileFromAgreement> _fileDetacher;
        private readonly IHandleCommands<AttachFileToAgreement> _fileAttacher;
        private readonly IHandleCommands<UpdateInstitutionalAgreementHierarchy> _hierarchyHandler;

        public HandleCreateOrUpdateInstitutionalAgreementCommand(ICommandEntities entities
            , IHandleCommands<RemoveParticipantFromAgreement> participantRemover
            , IHandleCommands<AddParticipantToAgreement> participantAdder
            , IHandleCommands<RemoveContactFromAgreement> contactRemover
            , IHandleCommands<AddContactToAgreement> contactAdder
            , IHandleCommands<DetachFileFromAgreement> fileDetacher
            , IHandleCommands<AttachFileToAgreement> fileAttacher
            , IHandleCommands<UpdateInstitutionalAgreementHierarchy> hierarchyHandler
        )
        {
            _entities = entities;
            _participantRemover = participantRemover;
            _participantAdder = participantAdder;
            _contactRemover = contactRemover;
            _contactAdder = contactAdder;
            _fileDetacher = fileDetacher;
            _fileAttacher = fileAttacher;
            _hierarchyHandler = hierarchyHandler;
        }

        public void Handle(CreateOrUpdateInstitutionalAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // start with an agreement entity
            var entity = _entities.Get<InstitutionalAgreement>()
                .EagerLoad(_entities, new Expression<Func<InstitutionalAgreement, object>>[]
                {
                    a => a.Umbrella,
                })
                .SingleOrDefault(x => x.Id == command.Id);
            if (entity == null && command.Id == 0)
                entity = new InstitutionalAgreement();
            if (entity == null)
                throw new InvalidOperationException(string.Format(
                    "Agreement with id '{0}' does not exist.", command.Id));

            // update scalars
            CopyScalars(command, entity);

            // scenario 1: no previous umbrella, no current umbrella.
            // scenario 2: no previous umbrella, with current umbrella.
            // scenario 3: with previous umbrella, same current umbrella.
            // scenario 4: with previous umbrella, different current umbrella.
            // scenario 5: with previous umbrella, no current umbrella.
            var previousUmbrella = entity.Umbrella;
            if (command.UmbrellaId.HasValue &&
                (previousUmbrella == null || previousUmbrella.Id != command.UmbrellaId.Value))
            {
                entity.Umbrella = _entities.Get<InstitutionalAgreement>().ById(command.UmbrellaId.Value);
                ++command.ChangeCount;
            }
            else if (previousUmbrella != null && !command.UmbrellaId.HasValue)
            {
                entity.Umbrella = null;
                ++command.ChangeCount;
            }

            #region Participants

            if (command.RemoveParticipantEstablishmentIds != null)
                foreach (var removedParticipantEstablishmentId in command.RemoveParticipantEstablishmentIds)
                {
                    var remove = new RemoveParticipantFromAgreement(
                        command.Principal, removedParticipantEstablishmentId, entity.Id);
                    _participantRemover.Handle(remove);
                    if (remove.IsNewlyRemoved) ++command.ChangeCount;
                }

            if (command.AddParticipantEstablishmentIds != null)
                foreach (var addedParticipantEstablishmentId in command.AddParticipantEstablishmentIds)
                {
                    var add = new AddParticipantToAgreement(command.Principal, addedParticipantEstablishmentId, entity);
                    _participantAdder.Handle(add);
                    if (add.IsNewlyAdded) ++command.ChangeCount;
                }

            #endregion
            #region Contacts

            if (command.RemoveContactIds != null)
                foreach (var removedContactEntityId in command.RemoveContactIds.Where(v => v != 0))
                {
                    var remove = new RemoveContactFromAgreement(
                        command.Principal, removedContactEntityId, entity.Id);
                    _contactRemover.Handle(remove);
                    if (remove.IsNewlyRemoved) ++command.ChangeCount;
                }

            if (command.AddContactCommands != null)
                foreach (var add in command.AddContactCommands)
                {
                    add.Agreement = entity;
                    _contactAdder.Handle(add);
                    if (add.IsNewlyAdded) ++command.ChangeCount;
                }

            #endregion
            #region Files

            if (command.DetachFileEntityIds != null)
                foreach (var removedFileEntityId in command.DetachFileEntityIds)
                {
                    var detach = new DetachFileFromAgreement(
                        command.Principal, removedFileEntityId, entity.Id);
                    _fileDetacher.Handle(detach);
                    if (detach.IsNewlyDetached) ++command.ChangeCount;

                }

            if (command.AttachFileEntityIds != null)
                foreach (var attachedFileIds in command.AttachFileEntityIds)
                {
                    var attach = new AttachFileToAgreement(command.Principal, attachedFileIds, entity);
                    _fileAttacher.Handle(attach);
                    if (attach.IsNewlyAttached) ++command.ChangeCount;
                }

            #endregion

            command.Id = entity.Id;
            if (entity.Id == 0 || command.ChangeCount > 0)
            {
                if (entity.Id == 0) _entities.Create(entity);
                else if (command.ChangeCount > 0) _entities.Update(entity);
                DeriveNodes(entity, previousUmbrella);
                command.Id = entity.Id;
            }
        }

        private void DeriveNodes(InstitutionalAgreement agreement, InstitutionalAgreement previousUmbrella)
        {
            _hierarchyHandler.Handle(new UpdateInstitutionalAgreementHierarchy(agreement));
            if (previousUmbrella != null &&
                (agreement.Umbrella == null || agreement.Umbrella.Id != previousUmbrella.Id))
                _hierarchyHandler.Handle(new UpdateInstitutionalAgreementHierarchy(previousUmbrella));
        }

        private static void CopyScalars(CreateOrUpdateInstitutionalAgreement command, InstitutionalAgreement entity)
        {
            if (command.Title != entity.Title) ++command.ChangeCount;
            if (command.IsTitleDerived != entity.IsTitleDerived) ++command.ChangeCount;
            if (command.Type != entity.Type) ++command.ChangeCount;
            if (command.Status != entity.Status) ++command.ChangeCount;
            if (command.Description != entity.Description) ++command.ChangeCount;
            if (command.IsAutoRenew != entity.IsAutoRenew) ++command.ChangeCount;
            if (command.StartsOn != entity.StartsOn) ++command.ChangeCount;
            if (command.ExpiresOn != entity.ExpiresOn) ++command.ChangeCount;
            if (command.IsExpirationEstimated != entity.IsExpirationEstimated) ++command.ChangeCount;
            if (command.Visibility != entity.Visibility) ++command.ChangeCount;

            entity.Title = command.Title;
            entity.IsTitleDerived = command.IsTitleDerived;
            entity.Type = command.Type;
            entity.Status = command.Status;
            entity.Description = command.Description;
            entity.IsAutoRenew = command.IsAutoRenew;
            entity.StartsOn = command.StartsOn;
            entity.ExpiresOn = command.ExpiresOn;
            entity.IsExpirationEstimated = command.IsExpirationEstimated;
            entity.Visibility = command.Visibility;
        }
    }
}
