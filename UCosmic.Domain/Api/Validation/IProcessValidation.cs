using FluentValidation.Results;

namespace UCosmic
{
    public interface IProcessValidation
    {
        ValidationResult Validate(object command);
        ValidationResult Validate<TResult>(IDefineQuery<TResult> query);
    }
}
