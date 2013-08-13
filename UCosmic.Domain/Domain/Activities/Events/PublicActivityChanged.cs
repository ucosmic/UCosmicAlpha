namespace UCosmic.Domain.Activities
{
    public class PublicActivityChanged : BaseEvent
    {
        public int ActivityId { get; set; }
    }
}