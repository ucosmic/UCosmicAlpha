namespace UCosmic.Domain.Agreements
{
    public abstract class AgreementSettingsFieldValue : Entity
    {
        public int Id { get; protected internal set; }

        public int ConfigurationId { get; protected internal set; }
        public virtual AgreementSettings Settings { get; protected internal set; }
        public string Text { get; protected internal set; }
    }

    public class AgreementSettingsTypeValue : AgreementSettingsFieldValue
    {
        protected internal AgreementSettingsTypeValue()
        {
        }
    }

    public class AgreementSettingsStatusValue : AgreementSettingsFieldValue
    {
        protected internal AgreementSettingsStatusValue()
        {
        }
    }

    public class AgreementSettingsContactTypeValue : AgreementSettingsFieldValue
    {
        protected internal AgreementSettingsContactTypeValue()
        {
        }
    }
}