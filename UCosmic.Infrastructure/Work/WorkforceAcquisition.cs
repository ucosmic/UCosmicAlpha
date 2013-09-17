using System;
using System.Collections.Generic;
using System.Linq;
using SimpleInjector;

namespace UCosmic.Work
{
    public class WorkforceAcquisition
    {
        private readonly Container _container;
        private readonly ILogExceptions _exceptionLogger;

        public WorkforceAcquisition(Container container, ILogExceptions exceptionLogger)
        {
            _container = container;
            _exceptionLogger = exceptionLogger;
        }

        public IEnumerable<dynamic> AcquireWorkers<TJob>(TJob job) where TJob : IDefineWork
        {
            var workerType = typeof(IPerformWork<>).MakeGenericType(job.GetType());
            IEnumerable<dynamic> workers = _container.GetAllInstances(workerType).ToArray();

            if (!workers.Any())
                _exceptionLogger.Log(new InvalidOperationException(string.Format(
                    "No workers exist for the '{0}' job.", job.GetType().FullName)));

            return workers;
        }
    }
}
