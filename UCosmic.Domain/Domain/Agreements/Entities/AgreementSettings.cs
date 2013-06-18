using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Agreements
{
    public class AgreementSettings : RevisableEntity
    {
        protected internal AgreementSettings()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            AllowedTypeValues = new Collection<AgreementSettingsTypeValue>();
            AllowedStatusValues = new Collection<AgreementSettingsStatusValue>();
            AllowedContactTypeValues = new Collection<AgreementSettingsContactTypeValue>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int? ForEstablishmentId { get; protected internal set; }
        public virtual Establishment ForEstablishment { get; protected internal set; }

        public bool IsCustomTypeAllowed { get; protected internal set; }
        public bool IsCustomStatusAllowed { get; protected internal set; }
        public bool IsCustomContactTypeAllowed { get; protected internal set; }

        public virtual ICollection<AgreementSettingsTypeValue> AllowedTypeValues { get; protected set; }
        public virtual ICollection<AgreementSettingsStatusValue> AllowedStatusValues { get; protected set; }
        public virtual ICollection<AgreementSettingsContactTypeValue> AllowedContactTypeValues { get; protected set; }

    }

}