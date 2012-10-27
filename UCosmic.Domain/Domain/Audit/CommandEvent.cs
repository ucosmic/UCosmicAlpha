using System;

namespace UCosmic.Domain.Audit
{
    public class CommandEvent : Entity
    {
        protected internal CommandEvent()
        {
            RaisedOnUtc = DateTime.UtcNow;
        }

        public int Id { get; protected internal set; }
        public string Name { get; protected internal set; }
        public string Value { get; set; }
        public DateTime RaisedOnUtc { get; protected internal set; }
        public string RaisedBy { get; protected internal set; }
        public string PreviousState { get; protected internal set; }
        public string NewState { get; protected internal set; }
    }
}
