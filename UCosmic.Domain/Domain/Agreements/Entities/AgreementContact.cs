using System;
using System.Collections.Generic;
using System.Threading;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Agreements
{
    public class InstitutionalAgreementContact : Entity
    {
        protected internal InstitutionalAgreementContact()
        {
            Guid = Guid.NewGuid();
            CreatedOnUtc = DateTime.UtcNow;
            CreatedByPrincipal = Thread.CurrentPrincipal.Identity.Name;
        }

        public int Id { get; protected set; }
        public Guid Guid { get; protected set; }

        public int AgreementId { get; protected internal set; }
        public virtual InstitutionalAgreement Agreement { get; protected internal set; }

        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected internal set; }

        public int? ParticipantAffiliationId { get; protected internal set; }
        public Establishment ParticipantAffiliation { get; protected internal set; }

        public string Type { get; protected internal set; }
        public string Title { get; protected internal set; }

        public virtual ICollection<InstitutionalAgreementContactPhone> PhoneNumbers { get; protected internal set; }

        public DateTime CreatedOnUtc { get; protected internal set; }
        public string CreatedByPrincipal { get; protected internal set; }
        public DateTime? UpdatedOnUtc { get; protected internal set; }
        public string UpdatedByPrincipal { get; protected internal set; }
        public byte[] Version { get; protected internal set; }
    }
}