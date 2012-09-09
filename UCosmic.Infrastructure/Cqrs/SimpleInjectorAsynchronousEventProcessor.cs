using System.Threading.Tasks;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public class SimpleInjectorAsynchronousEventProcessor : SimpleInjectorSynchronousEventProcessor
    {
        public SimpleInjectorAsynchronousEventProcessor(Container container, ILogExceptions exceptionLogger)
            :base(container, exceptionLogger)
        {
        }

        public override void Raise(IDefineEvent @event)
        {
            Task.Factory.StartNew(() =>
            {
                using (Container.BeginLifetimeScope())
                {
                    base.Raise(@event);
                }
            });
        }
    }
}