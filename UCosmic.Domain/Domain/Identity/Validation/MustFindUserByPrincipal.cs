using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustFindUserByPrincipal : PropertyValidator
    {
        public const string FailMessageFormat = "The principal identity name '{0}' does not have a user account.";

        private readonly IQueryEntities _entities;

        internal MustFindUserByPrincipal(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (IPrincipal)context.PropertyValue;

            var entity = _entities.Query<User>()
                .ByPrincipal(value);

            return entity != null;
        }
    }

    public static class MustFindUserByPrincipalExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustFindUserByPrincipal<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUserByPrincipal(entities));
        }
    }
}
