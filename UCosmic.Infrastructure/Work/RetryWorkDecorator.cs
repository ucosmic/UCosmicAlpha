using System;
using System.Diagnostics;
using System.Threading;

namespace UCosmic.Work
{
    public class RetryWorkDecorator<TJob> : IPerformWork<TJob> where TJob : IDefineWork
    {
        private readonly IPerformWork<TJob> _decorated;
        private readonly IScheduleWork _scheduler;
        private readonly IUnitOfWork _unitOfWork;

        public RetryWorkDecorator(IPerformWork<TJob> decorated, IScheduleWork scheduler, IUnitOfWork unitOfWork)
        {
            _decorated = decorated;
            _scheduler = scheduler;
            _unitOfWork = unitOfWork;
        }

        [DebuggerStepThrough]
        public void Perform(TJob job)
        {
            Perform(job, 3);
        }

        [DebuggerStepThrough]
        private void Perform(TJob job, int countDown)
        {
            try
            {
                _decorated.Perform(job);
            }
            catch (Exception ex)
            {
                if (!ex.IsRetryable() || --countDown <= 0)
                {
                    // job failed, reschedule it immediately
                    _scheduler.Reschedule(job, DateTime.UtcNow, ex);
                    throw;
                }

                _unitOfWork.DiscardChanges();
                Thread.Sleep(300);

                Perform(job, countDown);
            }
        }
    }
}
