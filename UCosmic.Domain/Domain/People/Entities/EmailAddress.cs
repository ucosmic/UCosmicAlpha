using System.Collections.Generic;
using Newtonsoft.Json;

namespace UCosmic.Domain.People
{
    public class EmailAddress : Entity, IAmNumbered
    {
        protected internal EmailAddress()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Confirmations = new List<EmailConfirmation>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public string Value { get; protected internal set; }
        public bool IsDefault { get; protected internal set; }
        public bool IsFromSaml { get; protected internal set; }
        public bool IsConfirmed { get; protected internal set; }
        
        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected internal set; }
        public int Number { get; protected internal set; }
        public virtual ICollection<EmailConfirmation> Confirmations { get; protected set; }

        public override string ToString()
        {
            return Value ?? base.ToString();
        }
    }

    internal static class EmailAddressSerializer
    {
        internal static string ToJsonAudit(this EmailAddress entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.PersonId,
                entity.Number,
                entity.Value,
                entity.IsDefault,
                entity.IsConfirmed,
                entity.IsFromSaml,
            });
            return state;
        }
    }
}