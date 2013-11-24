namespace UCosmic
{
    public abstract class BaseEventHandler<TEvent> : IHandleEvent<TEvent> where TEvent : IDefineEvent
    {
        public abstract void Handle(TEvent e);
        public virtual int? AsyncAfterMilliseconds { get { return null; } }
    }
}