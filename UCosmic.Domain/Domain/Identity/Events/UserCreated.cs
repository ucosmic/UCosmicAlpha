using System;
using System.Security.Principal;
using System.Threading;

namespace UCosmic.Domain.Identity
{
    public class UserCreated : BaseEvent
    {
        public EventWaitHandle Signal { get; set; }
        public int UserId { get; set; }
        public bool IsSeeding { get; set; }

        public UserCreated(IPrincipal principal,int userId)
        {
            Principal = principal;
            UserId = userId;
            Signal = new EventWaitHandle(false, EventResetMode.AutoReset);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposing)
            {
                return;
            }
            
            if (Signal != null) { Signal.Dispose(); }
        }
    }
}