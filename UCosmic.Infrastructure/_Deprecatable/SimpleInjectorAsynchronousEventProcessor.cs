//using System.Threading.Tasks;
//using SimpleInjector;

//namespace UCosmic.Cqrs
//{
//    public class SimpleInjectorAsynchronousEventProcessor : SimpleInjectorSynchronousEventProcessor
//    {
//        public SimpleInjectorAsynchronousEventProcessor(Container container)
//            :base(container)
//        {
//        }

//        public override void Raise(IDefineEvent e)
//        {
//            Task.Factory.StartNew(() => base.Raise(e));
//        }
//    }
//}