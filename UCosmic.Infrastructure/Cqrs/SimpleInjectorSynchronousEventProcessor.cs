using System;
using System.Collections.Generic;
using System.Linq;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public class SimpleInjectorSynchronousEventProcessor : IProcessEvents
    {
        protected Container Container { get; private set; }
        private readonly ILogExceptions _exceptionLogger;

        public SimpleInjectorSynchronousEventProcessor(Container container, ILogExceptions exceptionLogger)
        {
            Container = container;
            _exceptionLogger = exceptionLogger;
        }

        public virtual void Raise(IDefineEvent @event)
        {
            if (@event == null) throw new ArgumentNullException("event");
            @event.RaisedOnUtc = DateTime.UtcNow;

            var handlerType = typeof(IHandleEvents<>).MakeGenericType(@event.GetType());
            IEnumerable<dynamic> handlers = Container.GetAllInstances(handlerType).ToArray();
            if (!handlers.Any())
            {
                var singleHandler = Container.GetInstance(handlerType);
                if (singleHandler != null)
                    handlers = new[] { singleHandler };
            }
            foreach (var handler in handlers)
            {
                try
                {
                    handler.Handle((dynamic)@event);
                }
                catch (Exception ex)
                {
                    _exceptionLogger.Log(ex);
                }
            }
        }
    }
}