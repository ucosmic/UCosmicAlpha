namespace UCosmic.Domain.Representatives
{
    public class ApplicationRecipient: Entity
    {
        public int Id { get; protected set; }
        public virtual int OwnerId { get; protected internal set; }
        public string EmailAddress { get; protected internal set; }

        public virtual RepModuleSettings Owner { get; protected internal set; }
    }
}
