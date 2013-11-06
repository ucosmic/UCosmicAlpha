using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using SimpleInjector;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;

namespace UCosmic.Work
{
    public class WebDevlopmentWorkerRole
    {
        private readonly Container _container;

        public WebDevlopmentWorkerRole(Container container)
        {
            _container = container;
        }

        private readonly IDictionary<IDefineWork, IEnumerable<dynamic>> _workforce =
            new Dictionary<IDefineWork, IEnumerable<dynamic>>
            {
                //{ new ProjectEmployeeSummaryViews(), null },
                //{ new ProjectActivityViews(), null },
                //{ new RepairPlaceHierarchies(), null },
            };

        public void OnStart()
        {
            var scheduler = _container.GetInstance<IScheduleWork>();
            var workforceAcquisition = _container.GetInstance<WorkforceAcquisition>();
            foreach (var job in _workforce.Keys.ToArray())
            {
                _workforce[job] = workforceAcquisition.AcquireWorkers(job);
                scheduler.Schedule(job, DateTime.UtcNow);
            }
        }

        // ReSharper disable FunctionNeverReturns
        public void Run(CancellationToken cancellationToken)
        {
            while (true)
            {
                if (cancellationToken.IsCancellationRequested) break;

                foreach (var task in _workforce)
                {
                    var job = task.Key;
                    var workers = task.Value;
                    foreach (var worker in workers)
                        worker.Perform((dynamic)job);
                }

                Thread.Sleep(1000 * 10);
            }
        }
        // ReSharper restore FunctionNeverReturns
    }
}