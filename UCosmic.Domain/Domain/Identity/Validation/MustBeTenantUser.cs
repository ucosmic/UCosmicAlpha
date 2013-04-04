using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeTenantUser<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform the '{1}' action for user #{2}.";

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeTenantUser(IQueryEntities entities, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _entities = entities;
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (int)context.PropertyValue;
            var principal = _principal((T)context.Instance);

            var tenantUserIds = _queryProcessor.Execute(new MyUsers(principal)).Select(x => x.RevisionId);
            var user = _entities.Query<User>().Single(x => x.RevisionId == value);
            return tenantUserIds.Contains(user.RevisionId);
        }
    }

    public static class MustBeTenantUserExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeTenantUser<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeTenantUser<T>(entities, queryProcessor, principal));
        }
    }
}
