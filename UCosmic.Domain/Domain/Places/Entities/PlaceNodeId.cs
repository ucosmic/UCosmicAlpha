namespace UCosmic.Domain.Places
{
    public class PlaceNodeId : CompositeId
    {
        protected internal PlaceNodeId() { }
        public int AncestorId { get; internal set; }
        public int OffspringId { get; internal set; }

        protected override object[] GetIdComponents()
        {
            return new object[] { AncestorId, OffspringId };
        }
    }
}