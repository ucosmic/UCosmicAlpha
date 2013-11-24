namespace UCosmic
{
    public interface ITriggerEvent<in TEvent> where TEvent : IDefineEvent
    {
        void Raise(TEvent e);
    }
}