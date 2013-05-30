using System;
using System.IO;
using System.Threading;

namespace UCosmic.Domain.Identity
{
    public class UserCreated : BaseEvent
    {
        public EventWaitHandle Signal { get; set; }
        public int UserId { get; set; }

        public UserCreated(int userId)
        {
            UserId = userId;
            Signal = new EventWaitHandle(false, EventResetMode.ManualReset);
        }

        /* Implement Dispose */
    }
}