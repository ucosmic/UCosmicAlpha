using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading;
using Microsoft.WindowsAzure.ServiceRuntime;
using SimpleInjector;
using UCosmic.CompositionRoot;
using UCosmic.Domain.Activities;

namespace UCosmic.Work
{
    public class WorkerRole : RoleEntryPoint
    {
        private Container _container;

        public override bool OnStart()
        {
            // Set the maximum number of concurrent connections 
            ServicePointManager.DefaultConnectionLimit = 12;

            // For information on handling configuration changes
            // see the MSDN topic at http://go.microsoft.com/fwlink/?LinkId=166357.

            _container = new Container(
                new ContainerOptions
                {
                    AllowOverridingRegistrations = true,
                }
            );

            var rootCompositionSettings = new RootCompositionSettings
            {
                Flags = RootCompositionFlags.Work,
            };
            _container.ComposeRoot(rootCompositionSettings);
            _container.Verify();

            var scheduler = _container.GetInstance<IScheduleWork>();
            var workforceAcquisition = _container.GetInstance<WorkforceAcquisition>();
            foreach (var job in _workforce.Keys.ToArray())
            {
                _workforce[job] = workforceAcquisition.AcquireWorkers(job);
                scheduler.Schedule(job, DateTime.UtcNow);
            }

            return base.OnStart();
        }

        private readonly IDictionary<IDefineWork, IEnumerable<dynamic>> _workforce =
            new Dictionary<IDefineWork, IEnumerable<dynamic>>
            {
                { new ProjectActivityViews(), null },
            };

        // ReSharper disable FunctionNeverReturns
        public override void Run()
        {
            // This is a sample worker implementation. Replace with your logic.
            Trace.TraceInformation("UCosmic.Work entry point called", "Information");

            while (true)
            {
                foreach (var task in _workforce)
                {
                    var job = task.Key;
                    var workers = task.Value;
                    foreach (var worker in workers)
                        worker.Perform((dynamic)job);
                }

                Thread.Sleep(1000);
                Trace.TraceInformation("Working", "Information");
            }
        }
        // ReSharper restore FunctionNeverReturns
    }
}
