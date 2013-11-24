using System.Collections.Generic;
using System.Linq;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public sealed class MultipleDispatchEventTrigger<TEvent> : ITriggerEvent<TEvent> where TEvent : IDefineEvent
    {
        private readonly Container _container;

        public MultipleDispatchEventTrigger(Container container)
        {
            _container = container;
        }

        private IEnumerable<IHandleEvent<TEvent>> GetHandlers()
        {
            var handlersType = typeof(IEnumerable<IHandleEvent<TEvent>>);
            var handlers = _container.GetCurrentRegistrations()
                .Where(x => handlersType.IsAssignableFrom(x.ServiceType))
                .Select(x => x.GetInstance()).Cast<IEnumerable<IHandleEvent<TEvent>>>()
                .SelectMany(x => x)
                .ToArray()
            ;
            return handlers;
        }

        void ITriggerEvent<TEvent>.Raise(TEvent e)
        {
            var handlers = GetHandlers();
            foreach (var handler in handlers)
            {
                handler.Handle(e);
            }
        }
    }
}