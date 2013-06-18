namespace UCosmic.Domain.Agreements
{
    public class AgreementNode : Entity
    {
        protected internal AgreementNode()
        {
        }

        public int AncestorId { get; protected internal set; }
        public virtual Agreement Ancestor { get; protected internal set; }

        public int OffspringId { get; protected internal set; }
        public virtual Agreement Offspring { get; protected internal set; }

        public int Separation { get; protected internal set; }
    }
}