namespace UCosmic.Domain.Agreements
{
    public class AgreementContactPhone : Entity
    {
        protected internal AgreementContactPhone()
        {
        }

        public int Id { get; protected set; }

        public int OwnerId { get; protected internal set; }
        public virtual AgreementContact Owner { get; protected internal set; }

        public string Type { get; protected internal set; }

        public string Value { get; protected internal set; }
    }
}