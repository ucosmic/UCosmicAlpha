using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeTenantRole : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform the '{1}' action for role #{2}.";

        private readonly IQueryEntities _entities;

        internal MustBeTenantRole(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (int)context.PropertyValue;

            var entity = _entities.Query<Role>()
                .SingleOrDefault(x => x.RevisionId == value);

            return entity != null && !RoleName.NonTenantRoles.Contains(entity.Name);
        }
    }

    public static class MustBeTenantRoleExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeTenantRole<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustBeTenantRole(entities));
        }
    }
}
