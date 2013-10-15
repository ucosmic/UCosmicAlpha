namespace UCosmic.Domain.Places
{
    public class PlaceNode : EntityWithId<PlaceNodeId>
    {
        protected internal PlaceNode()
        {
            Id = new PlaceNodeId();
        }

        public int AncestorId
        {
            get { return Id.AncestorId; }
            protected internal set { Id.AncestorId = value; }
        }

        public virtual Place Ancestor { get; protected internal set; }

        public int OffspringId
        {
            get { return Id.OffspringId; }
            protected internal set { Id.OffspringId = value; }
        }

        public virtual Place Offspring { get; protected internal set; }

        public int Separation { get; protected internal set; }

        public override string ToString()
        {
            return string.Format("{0} ({1}) {2}", Ancestor.OfficialName, Separation, Offspring.OfficialName);
        }
    }
}