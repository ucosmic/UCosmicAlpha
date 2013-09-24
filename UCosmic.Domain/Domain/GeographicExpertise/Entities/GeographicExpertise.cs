using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.People;

namespace UCosmic.Domain.GeographicExpertise
{
    public class GeographicExpertise : RevisableEntity
    {
        protected bool Equals(GeographicExpertise other)
        {
            return Locations.SequenceEqual(other.Locations) &&
                    string.Equals(Description, other.Description);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((GeographicExpertise)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = Locations.GetHashCode();
                hashCode = (hashCode * 397) ^ (Description != null ? Description.GetHashCode() : 0);
                return hashCode;
            }
        }

        public GeographicExpertise()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Locations = new Collection<GeographicExpertiseLocation>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public virtual ICollection<GeographicExpertiseLocation> Locations { get; protected set; }
        public string Description { get; protected internal set; }
    }
}
