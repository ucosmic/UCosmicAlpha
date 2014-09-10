using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Home
{
    public class MustFindHomeSectionById<T> : PropertyValidator
    {
        public const string FailMessageFormat = "HomeSection with id '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{HomeSectionId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustFindHomeSectionById(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindHomeSectionById(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
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

            var homeSectionId = (int)context.PropertyValue;
            var principal = _principal != null ? _principal((T)context.Instance) : null;
            context.MessageFormatter.AppendArgument("HomeSectionId", homeSectionId);

            var entity = _entities != null
                ? _entities.Query<HomeSection>().ById(homeSectionId)
                : _queryProcessor.Execute(new HomeSectionById(homeSectionId));

            return entity != null;
        }
    }

    public static class MustFindHomeSectionByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindHomeSectionById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindHomeSectionById<T>(entities));
        }

        public static IRuleBuilderOptions<T, int> MustFindHomeSectionById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustFindHomeSectionById<T>(queryProcessor, principal));
        }
    }
}
