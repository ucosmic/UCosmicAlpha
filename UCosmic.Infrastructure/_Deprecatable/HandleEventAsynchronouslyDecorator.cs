//using System;
//using System.Threading.Tasks;
//using SimpleInjector;

//namespace UCosmic.Cqrs
//{
//    public class HandleEventAsynchronouslyDecorator<TEvent> : IHandleEvent<TEvent> where TEvent : IDefineEvent
//    {
//        private readonly Container _container;
//        private readonly Func<IHandleEvent<TEvent>> _factory;

//        public HandleEventAsynchronouslyDecorator(Container container, Func<IHandleEvent<TEvent>> factory)
//        {
//            _container = container;
//            _factory = factory;
//        }

//        public void Handle(TEvent e)
//        {
//            Task.Factory.StartNew(() =>
//            {
//                if (_container.GetCurrentLifetimeScope() != null)
//                {
//                    _factory().Handle(e);
//                }
//                else
//                {
//                    using (_container.BeginLifetimeScope())
//                    {
//                        _factory().Handle(e);
//                    }
//                }
//            });
//        }
//    }
//}
