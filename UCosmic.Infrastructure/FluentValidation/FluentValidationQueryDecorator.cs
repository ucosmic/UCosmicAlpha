using System.Diagnostics;
using FluentValidation;

namespace UCosmic.FluentValidation
{
    public class FluentValidationQueryDecorator<TQuery, TResult> : IHandleQueries<TQuery, TResult> where TQuery : IDefineQuery<TResult>
    {
        private readonly IHandleQueries<TQuery, TResult> _decorated;
        private readonly IValidator<TQuery> _validator;

        public FluentValidationQueryDecorator(IHandleQueries<TQuery, TResult> decorated
            , IValidator<TQuery> validator
        )
        {
            _decorated = decorated;
            _validator = validator;
        }

        [DebuggerStepThrough]
        public TResult Handle(TQuery command)
        {
            _validator.ValidateAndThrow(command);

            return _decorated.Handle(command);
        }
    }
}
