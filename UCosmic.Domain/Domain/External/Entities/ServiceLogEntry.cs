using System;

namespace UCosmic.Domain.External
{
    public class ServiceLogEntry
    {
        protected internal ServiceLogEntry()
        {
            LoggedOnUtc = DateTime.UtcNow;
            EntityId = Guid.NewGuid();
        }

        public string IntegrationName { get; protected internal set; }
        public int TenantId { get; protected internal set; }
        public virtual ServiceIntegration Integration { get; protected set; }
        public Guid EntityId { get; protected set; }

        public DateTime LoggedOnUtc { get; protected set; }
        public string Subject { get; protected internal set; }
        public string Log { get; protected internal set; }
    }
}