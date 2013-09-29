namespace UCosmic.Domain.Activities
{
    internal static class IsActivity
    {
        internal static bool WorkCopy(int activityId, IProcessQueries queryProcessor)
        {
            var activity = queryProcessor.Execute(new ActivityById(activityId));
            return activity != null && activity.Original != null;
        }

        internal static bool Original(int activityId, IProcessQueries queryProcessor)
        {
            var activity = queryProcessor.Execute(new ActivityById(activityId));
            return activity != null && activity.WorkCopy != null;
        }
    }
}
