using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Home
{
    public class MustFindHomeAlertById<T> : PropertyValidator
    {
        public const string FailMessageFormat = "HomeAlert with id '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{HomeAlertId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustFindHomeAlertById(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindHomeAlertById(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormatter)
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

            var homeAlertId = (int)context.PropertyValue;
            var principal = _principal != null ? _principal((T)context.Instance) : null;
            context.MessageFormatter.AppendArgument("HomeAlertId", homeAlertId);

            var entity = _entities != null
                ? _entities.Query<HomeAlert>().ById(homeAlertId)
                : _queryProcessor.Execute(new HomeAlertById(homeAlertId));

            return entity != null;
        }
    }

    public static class MustFindHomeAlertByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindHomeAlertById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindHomeAlertById<T>(entities));
        }

        public static IRuleBuilderOptions<T, int> MustFindHomeAlertById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustFindHomeAlertById<T>(queryProcessor, principal));
        }
    }
}
