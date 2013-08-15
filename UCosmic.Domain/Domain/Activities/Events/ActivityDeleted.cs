namespace UCosmic.Domain.Activities
{
    public class ActivityDeleted : BaseEvent
    {
        public int ActivityId { get; set; }
    }
}
