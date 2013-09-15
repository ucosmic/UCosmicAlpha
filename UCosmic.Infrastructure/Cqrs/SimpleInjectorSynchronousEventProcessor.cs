using System;
using System.Collections.Generic;
using System.Linq;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public class SimpleInjectorSynchronousEventProcessor : IProcessEvents
    {
        private Container Container { get; set; }

        public SimpleInjectorSynchronousEventProcessor(Container container)
        {
            Container = container;
        }

        public virtual void Raise(IDefineEvent @event)
        {
            if (@event == null) throw new ArgumentNullException("event");
            @event.RaisedOnUtc = DateTime.UtcNow;

            var handlerType = typeof(IHandleEvents<>).MakeGenericType(@event.GetType());
            IEnumerable<dynamic> handlers = Container.GetAllInstances(handlerType).ToArray();

            foreach (var handler in handlers) handler.Handle((dynamic)@event);
        }
    }
}