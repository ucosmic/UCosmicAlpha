using System;
using System.Security.Principal;

namespace UCosmic
{
    public interface IDefineEvent
    {
        IPrincipal Principal { get; set; }
        DateTime RaisedOnUtc { get; set; }
    }
}