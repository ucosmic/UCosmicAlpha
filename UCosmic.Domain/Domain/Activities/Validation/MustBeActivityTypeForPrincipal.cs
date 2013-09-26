using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class MustBeActivityTypeForPrincipal<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeActivityTypeForPrincipal(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base("Activity type id '{PropertyValue}' cannot be used by '{UserName}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityTypeId = (int)context.PropertyValue;
            var principal = _principal((T) context.Instance);

            var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByUserName(principal.Identity.Name)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.ActivityTypes,
                }
            });
            if (settings != null && settings.ActivityTypes.Select(x => x.Id).Contains(activityTypeId))
                return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            context.MessageFormatter.AppendArgument("UserName", principal.Identity.Name);
            return false;
        }
    }

    public static class MustBeActivityTypeForPrincipalExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeActivityTypeForPrincipal<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeActivityTypeForPrincipal<T>(queryProcessor, principal));
        }
    }
}
