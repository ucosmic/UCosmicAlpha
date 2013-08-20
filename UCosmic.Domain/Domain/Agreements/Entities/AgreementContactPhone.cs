using Newtonsoft.Json;

namespace UCosmic.Domain.Agreements
{
    public class AgreementContactPhone : Entity
    {
        protected internal AgreementContactPhone()
        {
        }

        public int Id { get; protected set; }

        public int OwnerId { get; protected internal set; }
        public virtual AgreementContact Owner { get; protected internal set; }

        public string Type { get; protected internal set; }

        public string Value { get; protected internal set; }
    }

    internal static class AgreementContactPhoneSerializer
    {
        internal static string ToJsonAudit(this AgreementContactPhone entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.Id,
                entity.OwnerId,
                entity.Type,
                entity.Value,
            });
            return state;
        }
    }
}