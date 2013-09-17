using System;

namespace UCosmic.Cqrs
{
    public class JsonView
    {
        public int Id { get; protected internal set; }
        public string Key { get; protected internal set; }
        public string Value { get; protected internal set; }
        public DateTime UpdatedOnUtc { get; protected internal set; }
    }
}