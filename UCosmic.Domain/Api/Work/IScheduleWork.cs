using System;

namespace UCosmic
{
    public interface IScheduleWork
    {
        void Schedule(IDefineWork job, DateTime onUtc);
        void Reschedule(IDefineWork job, DateTime onUtc, Exception exception);
        DateTime? GetSchedule(IDefineWork job);
    }
}