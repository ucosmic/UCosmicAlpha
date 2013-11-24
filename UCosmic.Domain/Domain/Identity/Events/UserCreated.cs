using System;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class UserCreated : IDefineEvent
    {
        public UserCreated(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int UserId { get; set; }
        public int PersonId { get; set; }
        public int TenantId { get; set; }
    }
}