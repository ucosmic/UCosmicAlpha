namespace UCosmic.Domain.Activities
{
    internal class ActivityCountTrendViewsDirtyFlagger : IHandleEvents<PublicActivityChanged>
    {
        private readonly IManageViews _viewManager;

        public ActivityCountTrendViewsDirtyFlagger(IManageViews viewManager)
        {
            _viewManager = viewManager;
        }

        public void Handle(PublicActivityChanged @event)
        {
            _viewManager.Set<ActivityCountTrendViewsDirtyFlag>(new ActivityCountTrendViewsDirtyFlag {IsDirty = true});
        }
    }
}
