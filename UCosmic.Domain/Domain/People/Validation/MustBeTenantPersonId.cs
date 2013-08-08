using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustBeTenantPersonId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform the '{1}' action for person  with id '{2}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeTenantPersonId(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{UserName}".Replace("{1}", "{CommandName}").Replace("{2}", "{PersonId}")))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            var personId = (int)context.PropertyValue;
            var principal = _principal((T)context.Instance);
            context.MessageFormatter.AppendArgument("UserName", principal.Identity.Name);
            context.MessageFormatter.AppendArgument("CommandName", context.Instance.GetType().Name);
            context.MessageFormatter.AppendArgument("PersonId", personId);

            var tenantPeopleIds = _queryProcessor.Execute(new MyPeople(principal)).Select(x => x.RevisionId);
            return tenantPeopleIds.Contains(personId);
        }
    }

    public static class MustBeTenantPersonIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeTenantPersonId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeTenantPersonId<T>(queryProcessor, principal));
        }
    }
}
