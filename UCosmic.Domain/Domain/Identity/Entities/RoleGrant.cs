using Newtonsoft.Json;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Identity
{
    public class RoleGrant : RevisableEntity
    {
        protected internal RoleGrant()
        {
        }

        public virtual User User { get; protected internal set; }
        public virtual Role Role { get; protected internal set; }
        public virtual Establishment ForEstablishment { get; protected internal set; }
    }

    internal static class RoleGrantSerializer
    {
        internal static string ToJsonAudit(this RoleGrant entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                ForEstablishmentId = entity.ForEstablishment != null ? entity.ForEstablishment.RevisionId : (int?)null,
                UserId = entity.User.RevisionId,
                RoleId = entity.Role.RevisionId,
            });
            return state;
        }
    }
}