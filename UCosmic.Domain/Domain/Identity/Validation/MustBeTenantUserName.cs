using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeTenantUserName<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform the '{1}' action for user '{2}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeTenantUserName(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (string)context.PropertyValue;
            var principal = _principal((T)context.Instance);

            var tenantUserNames = _queryProcessor.Execute(new MyUsers(principal)).Select(x => x.Name);
            var user = _queryProcessor.Execute(new UserByName(value));
            return tenantUserNames.Contains(user.Name);
        }
    }

    public static class MustBeTenantUserNameExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeTenantUserName<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeTenantUserName<T>(queryProcessor, principal));
        }
    }
}
