using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.External
{
    public class ServiceIntegration : Entity
    {
        protected internal ServiceIntegration()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            StringAttributes = new Collection<ServiceStringAttribute>();
            LogEntries = new Collection<ServiceLogEntry>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public string Name { get; protected internal set; }
        public int TenantId { get; protected internal set; }
        public virtual ServiceManifest Manifest { get; protected set; }

        public virtual ICollection<ServiceStringAttribute> StringAttributes { get; protected set; }
        public virtual ICollection<ServiceLogEntry> LogEntries { get; protected set; }
    }
}