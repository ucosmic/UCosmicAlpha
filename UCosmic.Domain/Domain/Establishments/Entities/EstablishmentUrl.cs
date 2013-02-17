using Newtonsoft.Json;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentUrl : RevisableEntity
    {
        protected internal EstablishmentUrl()
        {
        }

        public virtual Establishment ForEstablishment { get; protected internal set; }
        public string Value { get; protected internal set; }

        public bool IsOfficialUrl { get; protected internal set; }
        public bool IsFormerUrl { get; protected internal set; }

        public override string ToString()
        {
            return Value;
        }
    }

    internal static class EstablishmentUrlSerializer
    {
        internal static string ToJsonAudit(this EstablishmentUrl entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                ForEstablishmentId = entity.ForEstablishment.RevisionId,
                entity.Value,
                entity.IsOfficialUrl,
                entity.IsFormerUrl,
            });
            return state;
        }
    }
}