using System.Diagnostics;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    sealed class SimpleInjectorQueryProcessor : IProcessQueries
    {
        private readonly Container _container;

        public SimpleInjectorQueryProcessor(Container container)
        {
            _container = container;
        }

        [DebuggerStepThrough]
        public TResult Execute<TResult>(IDefineQuery<TResult> query)
        {
            var handlerType = typeof(IHandleQueries<,>).MakeGenericType(query.GetType(), typeof(TResult));

            dynamic handler = _container.GetInstance(handlerType);

            return handler.Handle((dynamic)query);
        }
    }
}
