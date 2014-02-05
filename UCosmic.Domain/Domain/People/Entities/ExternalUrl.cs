namespace UCosmic.Domain.People
{
    public class ExternalUrl : Entity
    {
        public int Id { get; protected set; }
        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected set; }
        public string Description { get; protected internal set; }
        public string Value { get; protected internal set; }

        public static class Constraints
        {
            public const int DescriptionMaxLength = 50;
            public const int ValueMaxLength = 2048;
        }
    }
}
