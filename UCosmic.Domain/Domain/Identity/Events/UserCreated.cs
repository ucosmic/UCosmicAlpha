using System;
using System.Threading;

namespace UCosmic.Domain.Identity
{
    public class UserCreated : BaseEvent
    {
        public EventWaitHandle Signal { get; set; }
        public int UserId { get; set; }
        public bool Seeding { get; set; }

        public UserCreated(int userId)
        {
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