using System.Collections.Generic;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Representatives
{
    public class RepModuleSettings : Entity
    {
        protected internal RepModuleSettings()
        {
        }

        public int Id { get; protected set; }
        public string WelcomeMessage { get; protected internal set; }
        public virtual Establishment Owner { get; protected internal set; }
        public virtual ICollection<ApplicationRecipient> ApplicationRecipients { get; protected internal set; }
    }
}
