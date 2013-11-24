using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.External
{
    public class ServiceManifest : Entity
    {
        protected internal ServiceManifest()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Integrations = new Collection<ServiceIntegration>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int TenantId { get; protected internal set; }
        public virtual Establishment Tenant { get; protected set; }
        public virtual ICollection<ServiceIntegration> Integrations { get; protected set; }
    }
}