using System;
using System.Diagnostics;
using System.Threading;

namespace UCosmic.Cqrs
{
    public class RetryQueryDecorator<TQuery, TResult> : IHandleQueries<TQuery, TResult> where TQuery : IDefineQuery<TResult>
    {
        private readonly IHandleQueries<TQuery, TResult> _decorated;

        public RetryQueryDecorator(IHandleQueries<TQuery, TResult> decorated, IUnitOfWork unitOfWork)
        {
            _decorated = decorated;
        }

        [DebuggerStepThrough]
        public TResult Handle(TQuery query)
        {
            return Handle(query, 3);
        }

        [DebuggerStepThrough]
        private TResult Handle(TQuery query, int countDown)
        {
            try
            {
                return _decorated.Handle(query);
            }
            catch (Exception ex)
            {
                if (!ex.IsRetryable() || --countDown <= 0)
                    throw;

                Thread.Sleep(300);

                return Handle(query, countDown);
            }
        }
    }
}