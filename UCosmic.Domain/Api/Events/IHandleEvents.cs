namespace UCosmic
{
    public interface IHandleEvents<in TEvent> where TEvent : IDefineEvent
    {
         void Handle(TEvent @event);
    }
}