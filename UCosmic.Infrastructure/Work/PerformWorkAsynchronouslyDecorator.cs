using System;
using System.Threading.Tasks;
using SimpleInjector;

namespace UCosmic.Work
{
    public class PerformWorkAsynchronouslyDecorator<TJob> : IPerformWork<TJob> where TJob : IDefineWork
    {
        private readonly Container _container;
        private readonly Func<IPerformWork<TJob>> _workerFactory;

        public PerformWorkAsynchronouslyDecorator(Container container, Func<IPerformWork<TJob>> workerFactory)
        {
            _container = container;
            _workerFactory = workerFactory;
        }

        public void Perform(TJob job)
        {
            Task.Factory.StartNew(() =>
            {
                using (_container.BeginLifetimeScope())
                    _workerFactory().Perform(job);
            });
        }
    }
}