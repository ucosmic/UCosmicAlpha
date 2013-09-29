using System;
using System.Linq;

namespace UCosmic.Domain
{
    public abstract class CompositeId : IEquatable<CompositeId>
    {
        protected abstract object[] GetIdComponents();

        public bool Equals(CompositeId other)
        {
            // instance is never equal to null
            if (other == null) return false;

            // when references are equal, they are the same object on the heap
            if (ReferenceEquals(this, other)) return true;

            // when neither object is transient
            if (!IsTransient(this) && !IsTransient(other))
            {
                // make sure the components are equal
                var theseComponents = GetIdComponents();
                var otherComponents = other.GetIdComponents();
                var componentsEqual = Equals(theseComponents[0], otherComponents[0]);
                for (var i = 1; i < theseComponents.Length; i++)
                {
                    if (!componentsEqual) break;
                    componentsEqual &= Equals(theseComponents[i], otherComponents[i]);
                }

                return componentsEqual;
            }
            return false;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as CompositeId);
        }

        public override int GetHashCode()
        {
            var components = GetIdComponents();
            var hashCode = components[0].GetHashCode();
            foreach (var component in components.Skip(1))
                hashCode ^= component.GetHashCode();
            return hashCode;
        }

        private static bool IsTransient(CompositeId obj)
        {
            var components = obj.GetIdComponents();
            var isTransient = false;
            foreach (var component in components.Where(x => !x.GetType().IsAssignableFrom(typeof (Enum))))
            {
                isTransient |= Equals(component, GetDefault(component.GetType()));
                if (isTransient) break;
            }
            return isTransient;
        }

        private static object GetDefault(Type type)
        {
            return type.IsValueType ? Activator.CreateInstance(type) : null;
        }
    }
}