using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustFindUserByPrincipal : PropertyValidator
    {
        private const string FailMessageFormat = "A user with name '{UserName}' does not exist.";

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        internal MustFindUserByPrincipal(IQueryEntities entities)
            : base(FailMessageFormat)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindUserByPrincipal(IProcessQueries queryProcessor)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var principal = (IPrincipal) context.PropertyValue;
            var userName = principal.Identity.Name;

            var entity = _entities != null
                ? _entities.Query<User>().ByName(userName)
                : _queryProcessor.Execute(new UserByName(userName));

            if (entity == null)
            {
                context.MessageFormatter.AppendArgument("UserName", userName);
                return false;
            }

            return true;
        }
    }

    public static class MustFindUserByPrincipalExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustFindUserByPrincipal<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUserByPrincipal(entities));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustFindUserByPrincipal<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindUserByPrincipal(queryProcessor));
        }
    }
}
