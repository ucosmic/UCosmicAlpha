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

        public static AgreementSettings Default
        {
            get
            {
                if (_default == null)
                {
                    _default = new AgreementSettings
                    {
                        IsCustomTypeAllowed = true,
                        AllowedTypeValues = new Collection<AgreementSettingsTypeValue>
                        {
                            new AgreementSettingsTypeValue { Text = "Activity Agreement" },
                            new AgreementSettingsTypeValue { Text = "Institutional Collaboration Agreement" },
                            new AgreementSettingsTypeValue { Text = "Memorandum of Understanding" },
                        },
                        IsCustomStatusAllowed = true,
                        AllowedStatusValues = new Collection<AgreementSettingsStatusValue>
                        {
                            new AgreementSettingsStatusValue { Text = "Active" },
                            new AgreementSettingsStatusValue { Text = "Dead" },
                            new AgreementSettingsStatusValue { Text = "Inactive" },
                            new AgreementSettingsStatusValue { Text = "Unknown" },
                        },
                        IsCustomContactTypeAllowed = true,
                        AllowedContactTypeValues = new Collection<AgreementSettingsContactTypeValue>
                        {
                            new AgreementSettingsContactTypeValue { Text = "Home Principal" },
                            new AgreementSettingsContactTypeValue { Text = "Home Secondary" },
                            new AgreementSettingsContactTypeValue { Text = "Partner Principal" },
                            new AgreementSettingsContactTypeValue { Text = "Partner Secondary" },
                        },
                    };
                }
                return _default;
            }
        }

        private static AgreementSettings _default;

    }

}