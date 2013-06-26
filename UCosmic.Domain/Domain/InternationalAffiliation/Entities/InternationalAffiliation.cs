using System;
using System.Linq;
using System.Collections.Generic;
using UCosmic.Domain.InternationalAffiliations;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Domain
{
    public class InternationalAffiliation : RevisableEntity
    {
        protected bool Equals(InternationalAffiliation other)
        {
            return  From.Equals(other.From) &&
                    To.Equals(other.To) &&
                    OnGoing.Equals(other.OnGoing) &&
                    string.Equals(Institution, other.Institution) &&
                    Locations.OrderBy(a => a.PlaceId).SequenceEqual(other.Locations.OrderBy(b => b.PlaceId)) &&
                    string.Equals(Position, other.Position);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((InternationalAffiliation) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = From.GetHashCode();
                hashCode = (hashCode*397) ^ To.GetHashCode();
                hashCode = (hashCode*397) ^ OnGoing.GetHashCode();
                hashCode = (hashCode*397) ^ (Institution != null ? Institution.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Locations != null ? Locations.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Position != null ? Position.GetHashCode() : 0);
                return hashCode;
            }
        }

        public InternationalAffiliation()
        {
            From = DateTime.Now;
            To = DateTime.Now;
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }

        public DateTime From { get; protected internal set; }
        public DateTime? To { get; protected internal set; }
        public bool OnGoing { get; protected internal set; }
        public string Institution { get; protected internal set; }
        public string Position { get; protected internal set; }
        public virtual ICollection<InternationalAffiliationLocation> Locations { get; protected internal set; }
    }
}
