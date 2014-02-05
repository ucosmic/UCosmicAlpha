using System.Diagnostics;
using SimpleInjector;

namespace UCosmic.Cqrs
{
    sealed class CommandProcessor : IProcessCommands
    {
        private readonly Container _container;

        public CommandProcessor(Container container)
        {
            _container = container;
        }

        [DebuggerStepThrough]
        public void Execute(object command)
        {
            var handlerType = typeof(IHandleCommands<>).MakeGenericType(command.GetType());
            dynamic handler = _container.GetInstance(handlerType);
            handler.Handle((dynamic)command);
        }
    }
}
