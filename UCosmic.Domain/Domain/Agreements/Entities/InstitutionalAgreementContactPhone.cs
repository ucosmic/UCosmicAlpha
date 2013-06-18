namespace UCosmic.Domain.Agreements
{
    public class InstitutionalAgreementContactPhone : Entity
    {
        protected internal InstitutionalAgreementContactPhone()
        {
        }

        public int Id { get; protected set; }

        public int OwnerId { get; protected internal set; }
        public virtual InstitutionalAgreementContact Owner { get; protected internal set; }

        public string Type { get; protected internal set; }

        public string Value { get; protected internal set; }
    }
}