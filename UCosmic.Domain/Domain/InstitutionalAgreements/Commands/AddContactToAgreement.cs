using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class AddContactToAgreement
    {
        public AddContactToAgreement(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public Guid EntityId { get; set; }
        public Guid AgreementEntityId { get; set; }
        internal InstitutionalAgreement Agreement { get; set; }
        public string ContactType { get; set; }
        public Guid PersonEntityId { get; set; }
        public string PersonDefaultEmail { get; set; }
        public string PersonDisplayName { get; set; }
        public string PersonSalutation { get; set; }
        public string PersonFirstName { get; set; }
        public string PersonMiddleName { get; set; }
        public string PersonLastName { get; set; }
        public string PersonSuffix { get; set; }
        public bool IsNewlyAdded { get; internal set; }
    }

    public class HandleAddContactToAgreementCommand : IHandleCommands<AddContactToAgreement>
    {
        private readonly ICommandEntities _entities;

        public HandleAddContactToAgreementCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(AddContactToAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var agreement = command.Agreement ??
                _entities.Get<InstitutionalAgreement>()
                .EagerLoad(_entities, new Expression<Func<InstitutionalAgreement, object>>[]
                {
                    r => r.Contacts.Select(c => c.Person),
                })
                .SingleOrDefault(e => e.EntityId == command.AgreementEntityId);

            if (command.EntityId != Guid.Empty && agreement != null)
            {
                var entity = agreement.Contacts.SingleOrDefault(
                    e => e.EntityId == command.EntityId);
                if (entity != null) return;
            }

            var contact = new InstitutionalAgreementContact
            {
                Agreement = agreement,
                Type = command.ContactType,
            };

            if (command.PersonEntityId != Guid.Empty)
                contact.Person = _entities.Get<Person>().SingleOrDefault(e => e.EntityId == command.PersonEntityId);
            else
                contact.Person = new Person
                {
                    Salutation = command.PersonSalutation,
                    FirstName = command.PersonFirstName,
                    MiddleName = command.PersonMiddleName,
                    LastName = command.PersonLastName,
                    Suffix = command.PersonSuffix,
                    DisplayName = command.PersonDisplayName,
                    Emails = (!string.IsNullOrWhiteSpace(command.PersonDefaultEmail))
                        ? new Collection<EmailAddress>
                        {
                            new EmailAddress
                            {
                                Value = command.PersonDefaultEmail,
                                IsDefault = true,
                            }
                        }
                        : new Collection<EmailAddress>(),
                };

            _entities.Create(contact);
            command.IsNewlyAdded = true;
        }
    }
}
