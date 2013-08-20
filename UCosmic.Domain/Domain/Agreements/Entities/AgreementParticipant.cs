using Newtonsoft.Json;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Agreements
{
    public class AgreementParticipant : Entity
    {
        protected internal AgreementParticipant()
        {
        }

        public int Id { get; protected internal set; }
        public bool IsOwner { get; protected internal set; }

        public int AgreementId { get; protected internal set; }
        public virtual Agreement Agreement { get; protected internal set; }

        public int EstablishmentId { get; protected internal set; }
        public virtual Establishment Establishment { get; protected internal set; }

        public override string ToString()
        {
            return string.Format("{0}, {1}",
                IsOwner ? "Owner: " : "Non-Owner: ",
                Establishment.OfficialName);
        }
    }

    internal static class AgreementParticipantSerializer
    {
        internal static string ToJsonAudit(this AgreementParticipant entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.Id,
                entity.AgreementId,
                entity.EstablishmentId,
                entity.IsOwner,
            });
            return state;
        }
    }
}