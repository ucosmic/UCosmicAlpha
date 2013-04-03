using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Representatives
{
    public class EmailNotification: Entity
    {
        public int? EstablishmentId;
        public ICollection<string> EmailAddress { get; protected internal set; }
    }
}
