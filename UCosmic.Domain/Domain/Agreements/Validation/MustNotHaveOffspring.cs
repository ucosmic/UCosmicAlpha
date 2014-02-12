using System;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustNotHaveOffspring<T> : PropertyValidator
    {
        //public const string FailMessageFormat1 = "Agreement with id '{0}' cannot be deleted because it is the umbrella for agreement(s) with id(s) '{1}'.";
        public const string FailMessage = "This agreement cannot be deleted because it is the umbrella for one or more other agreements.";
        //private static readonly string FailMessageFormatter = FailMessage.Replace("{0}", "{AgreementId}").Replace("{1}", "{OffspringIds}");

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustNotHaveOffspring(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessage)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is int?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var principal = _principal((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);

            var entity = _queryProcessor.Execute(new AgreementById(principal, agreementId)
            {
                EagerLoad = new Expression<Func<Agreement, object>>[]
                {
                    x => x.Offspring,
                }
            });

            if (entity != null && entity.Offspring.Any())
            {
                var offspringAgreementIds = entity.Offspring.Select(x => x.OffspringId)
                    .Select(x => x.ToString(CultureInfo.InvariantCulture));
                context.MessageFormatter.AppendArgument("OffspringIds", offspringAgreementIds.Implode(", "));
                return false;
            }

            return true;
        }
    }

    public static class MustNotHaveOffspringExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotHaveOffspring<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustNotHaveOffspring<T>(queryProcessor, principal));
        }
    }
}
