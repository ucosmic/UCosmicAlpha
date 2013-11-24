namespace UCosmic.Domain.Establishments
{
    public class EstablishmentCustomId : Entity
    {
        protected internal EstablishmentCustomId() { }

        public int EstablishmentId { get; protected internal set; }
        public virtual Establishment Owner { get; protected internal set; }
        public string Value { get; protected internal set; }
    }
}