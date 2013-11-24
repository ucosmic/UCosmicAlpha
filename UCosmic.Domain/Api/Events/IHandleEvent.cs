namespace UCosmic
{
    public interface IHandleEvent<in TEvent> where TEvent : IDefineEvent
    {
        void Handle(TEvent e);
        int? AsyncAfterMilliseconds { get; }
    }
}