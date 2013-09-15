using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Work
{
    public class PoorMansWorkScheduler : IScheduleWork
    {
        private static IDictionary<IDefineWork, DateTime> _schedule = new Dictionary<IDefineWork, DateTime>();

        public void Schedule(IDefineWork job, DateTime onUtc)
        {
            ScheduleInternal(job, onUtc);
        }

        public void Reschedule(IDefineWork job, DateTime onUtc, Exception exception)
        {
            ScheduleInternal(job, onUtc, exception);
        }

        private static void ScheduleInternal(IDefineWork job, DateTime onUtc, Exception exception = null)
        {
            lock (_schedule)
            {
                var scheduledJob = _schedule.Keys.SingleOrDefault(x => x.GetType() == job.GetType());
                var scheduledOn = scheduledJob != null ?  _schedule[scheduledJob] : (DateTime?)null;

                // only schedule if the job is not already scheduled
                if (scheduledJob == null)
                {
                    _schedule.Add(job, onUtc);
                }

                    // or the job should be scheduled sooner than it is scheduled
                else if (exception != null && scheduledOn > onUtc)
                {
                    _schedule[scheduledJob] = onUtc;
                }
            }
        }

        public DateTime? GetSchedule(IDefineWork job)
        {
            lock (_schedule)
            {
                var scheduledJob = _schedule.Keys.SingleOrDefault(x => x.GetType() == job.GetType());
                var scheduledOn = scheduledJob != null ? _schedule[scheduledJob] : (DateTime?)null;

                // only return if job is scheduled to run in the past
                if (scheduledJob != null && scheduledOn < DateTime.UtcNow)
                {
                    // schedule the next run
                    var performOn = scheduledOn;
                    _schedule[scheduledJob] = DateTime.UtcNow.Add(job.Interval);
                    return performOn;
                }

                return null;
            }
        }
    }
}