using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Representatives
{
    public class ApplicationRecipient: Entity
    {
        public int Id { get; protected internal set; }
        public int RepModuleSettingsId { get; set; }
        public string EmailAddress { get; protected internal set; }

        public ApplicationRecipient()
        {}
    }
}
