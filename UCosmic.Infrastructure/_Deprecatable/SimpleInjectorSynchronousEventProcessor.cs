//using System;
//using System.Collections.Generic;
//using System.Linq;
//using SimpleInjector;

//namespace UCosmic.Cqrs
//{
//    public class SimpleInjectorSynchronousEventProcessor : IProcessEvents
//    {
//        private Container Container { get; set; }

//        public SimpleInjectorSynchronousEventProcessor(Container container)
//        {
//            Container = container;
//        }

//        public virtual void Raise(IDefineEvent e)
//        {
//            if (e == null) throw new ArgumentNullException("event");

//            var handlerType = typeof(IHandleEvent<>).MakeGenericType(e.GetType());
//            IEnumerable<dynamic> handlers = Container.GetAllInstances(handlerType).ToArray();

//            foreach (var handler in handlers) handler.Handle((dynamic)e);
//        }
//    }
//}