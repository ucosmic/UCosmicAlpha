using System;

namespace UCosmic.Domain.Audit
{
    public class Deletion : Entity
    {
        protected internal Deletion()
        {
            CommandedOnUtc = DateTime.UtcNow;
        }

        public int Id { get; protected internal set; }
        public string CommandName { get; protected internal set; }
        public DateTime CommandedOnUtc { get; protected internal set; }
        public string CommandedBy { get; protected internal set; }
        public string PreviousState { get; protected internal set; }
    }
}
