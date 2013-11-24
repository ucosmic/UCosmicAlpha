namespace UCosmic.Domain.External
{
    public class ServiceStringAttribute
    {
        protected internal ServiceStringAttribute() { }

        public string IntegrationName { get; protected internal set; }
        public int TenantId { get; protected internal set; }
        public virtual ServiceIntegration Integration { get; protected set; }

        public string Name { get; protected internal set; }
        public string Value { get; protected internal set; }
    }
}