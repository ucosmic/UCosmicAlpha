using System;
using System.Threading;
using System.Threading.Tasks;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    public sealed class HandleEventAsynchronouslyDecorator<TEvent> : IHandleEvent<TEvent> where TEvent : IDefineEvent
    {
        private readonly Container _container;
        private readonly Func<IHandleEvent<TEvent>> _factory;
        private readonly IHandleEvent<TEvent> _handler;

        public HandleEventAsynchronouslyDecorator(Container container, Func<IHandleEvent<TEvent>> factory)
        {
            _container = container;
            _factory = factory;
            _handler = _factory();
        }

        void IHandleEvent<TEvent>.Handle(TEvent e)
        {
            // execute the handler synchronously when it specifies async less than or equal to zero
            if (_handler.AsyncAfterMilliseconds.HasValue && _handler.AsyncAfterMilliseconds.Value < 1)
            {
                _handler.Handle(e);
            }
            else
            {
                // otherwise, execute the handler asynchronously and possibly wait on it for a bit
                var waitHandle = _handler.AsyncAfterMilliseconds.HasValue
                    ? new EventWaitHandle(false, EventResetMode.AutoReset)
                    : null;
                Task.Factory.StartNew(() =>
                {
                    if (_container.GetCurrentLifetimeScope() != null)
                    {
                        _handler.Handle(e);
                    }
                    else
                    {
                        using (_container.BeginLifetimeScope())
                        {
                            // do not use the closed handler, get a fresh one from the container
                            _factory().Handle(e);
                        }
                    }
                    if (waitHandle != null) waitHandle.Set(); // tell the wait handle we are done now
                });

                if (waitHandle != null)
                {   // wait for a bit on the async handler
                    waitHandle.WaitOne(_handler.AsyncAfterMilliseconds.Value);
                }
            }
        }

        public int? AsyncAfterMilliseconds { get { return _handler.AsyncAfterMilliseconds; } }
    }
}