using System;
using System.Security.Principal;

namespace UCosmic
{
    public class BaseEvent : IDefineEvent
    {
        public virtual IPrincipal Principal { get; set; }
        public DateTime RaisedOnUtc { get; set; }
    }
}
