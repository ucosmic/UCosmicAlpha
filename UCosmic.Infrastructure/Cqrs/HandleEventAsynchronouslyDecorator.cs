using System;
using System.Threading.Tasks;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public class HandleEventAsynchronouslyDecorator<TEvent> : IHandleEvents<TEvent> where TEvent : IDefineEvent
    {
        private readonly Container _container;
        private readonly Func<IHandleEvents<TEvent>> _factory;

        public HandleEventAsynchronouslyDecorator(Container container, Func<IHandleEvents<TEvent>> factory)
        {
            _container = container;
            _factory = factory;
        }

        public void Handle(TEvent @event)
        {
            Task.Factory.StartNew(() =>
            {
                if (_container.GetCurrentLifetimeScope() != null)
                {
                    _factory().Handle(@event);
                }
                else
                {
                    using (_container.BeginLifetimeScope())
                    {
                        _factory().Handle(@event);
                    }
                }
            });
        }
    }
}
