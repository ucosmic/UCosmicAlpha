using System;

namespace UCosmic.Domain.Places
{
    public class PlaceNode : Entity, IEquatable<PlaceNode>
    {
        protected internal PlaceNode()
        {
        }

        public int AncestorId { get; protected internal set; }
        public virtual Place Ancestor { get; protected internal set; }

        public int OffspringId { get; protected internal set; }
        public virtual Place Offspring { get; protected internal set; }

        public int Separation { get; protected internal set; }

        public bool Equals(PlaceNode other)
        {
            if (other == null) return false;
            return other.AncestorId.Equals(AncestorId) && other.OffspringId.Equals(OffspringId);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return AncestorId ^ OffspringId;
            }
        }

        public override string ToString()
        {
            return string.Format("({0}) {1}", Separation, Offspring.OfficialName);
        }
    }
}