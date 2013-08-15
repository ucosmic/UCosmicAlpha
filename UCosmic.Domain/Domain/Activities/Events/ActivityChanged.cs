namespace UCosmic.Domain.Activities
{
    public class ActivityChanged : BaseEvent
    {
        public ActivityMode ActivityMode { get; set; }
        public int ActivityId { get; set; }
    }
}
