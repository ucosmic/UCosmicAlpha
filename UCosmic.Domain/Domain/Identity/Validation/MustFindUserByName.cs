using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustFindUserByName : PropertyValidator
    {
        public const string FailMessageFormat = "A user with name '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{UserName}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        internal MustFindUserByName(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindUserByName(IProcessQueries queryProcessor)
            : base(FailMessageFormatter)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string) && !(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string and IPrincipal properties", GetType().Name));

            var userName = context.PropertyValue is IPrincipal
                ? ((IPrincipal)context.PropertyValue).Identity.Name
                : (string)context.PropertyValue;
            context.MessageFormatter.AppendArgument("UserName", userName);

            var entity = _entities != null
                ? _entities.Query<User>().ByName(userName)
                : _queryProcessor.Execute(new UserByName(userName));

            return entity != null;
        }
    }

    public static class MustFindUserByNameExtensions
    {
        public static IRuleBuilderOptions<T, string> MustFindUserByName<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUserByName(entities));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustFindUserByPrincipal<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUserByName(entities));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustFindUserByPrincipal<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindUserByName(queryProcessor));
        }
    }
}
