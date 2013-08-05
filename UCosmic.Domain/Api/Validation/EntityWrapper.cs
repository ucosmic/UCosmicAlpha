using UCosmic.Domain;

namespace UCosmic
{
    public class EntityWrapper<T> where T : Entity
    {
        public T Entity { get; set; }
    }
}