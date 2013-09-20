using System;
using System.Diagnostics;
using System.Threading;

namespace UCosmic.Cqrs
{
    public class RetryCommandDecorator<TCommand> : IHandleCommands<TCommand>
    {
        private readonly IHandleCommands<TCommand> _decorated;
        private readonly IUnitOfWork _unitOfWork;

        public RetryCommandDecorator(IHandleCommands<TCommand> decorated, IUnitOfWork unitOfWork)
        {
            _decorated = decorated;
            _unitOfWork = unitOfWork;
        }

        [DebuggerStepThrough]
        public void Handle(TCommand command)
        {
            Handle(command, 3);
        }

        [DebuggerStepThrough]
        private void Handle(TCommand command, int countDown)
        {
            try
            {
                _decorated.Handle(command);
            }
            catch (Exception ex)
            {
                if (!ex.IsRetryable() || --countDown <= 0)
                    throw;

                _unitOfWork.DiscardChanges();
                Thread.Sleep(300);

                Handle(command, countDown);
            }
        }
    }
}
