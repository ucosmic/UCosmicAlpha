namespace UCosmic.Work
{
    public class PerformWorkOnScheduleDecorator<TJob> : IPerformWork<TJob> where TJob : IDefineWork
    {
        private readonly IPerformWork<TJob> _decorated;
        private readonly IScheduleWork _scheduler;

        public PerformWorkOnScheduleDecorator(IPerformWork<TJob> decorated, IScheduleWork scheduler)
        {
            _decorated = decorated;
            _scheduler = scheduler;
        }

        public void Perform(TJob job)
        {
            var performOnUtc = _scheduler.GetSchedule(job);
            if (!performOnUtc.HasValue) return;
            _decorated.Perform(job);
        }
    }
}