using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Degrees
{
    public class MustOwnDegree<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform this action on degree with id '{1}'.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{UserName}").Replace("{1}", "{DegreeId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _degreeId;

        internal MustOwnDegree(IQueryEntities entities, Func<T, int> degreeId)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (degreeId == null) throw new ArgumentNullException("degreeId");

            _entities = entities;
            _degreeId = degreeId;
        }

        internal MustOwnDegree(IProcessQueries queryProcessor, Func<T, int> degreeId)
            : base(FailMessageFormatter)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (degreeId == null) throw new ArgumentNullException("degreeId");

            _queryProcessor = queryProcessor;
            _degreeId = degreeId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            var principal = (IPrincipal)context.PropertyValue;
            var degreeId = _degreeId((T)context.Instance);
            context.MessageFormatter.AppendArgument("UserName", principal.Identity.Name);
            context.MessageFormatter.AppendArgument("DegreeId", degreeId);


            var eagerLoad = new Expression<Func<Degree, object>>[] { x => x.Person.User, };
            var degree = _entities != null
                ? _entities.Query<Degree>()
                    .EagerLoad(_entities, eagerLoad)
                    .SingleOrDefault(x => x.RevisionId == degreeId)

                : _queryProcessor.Execute(new DegreeById(degreeId) { EagerLoad = eagerLoad });

            return degree != null && degree.Person.User != null &&
                   degree.Person.User.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnDegreeExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnDegree<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> degreeId)
        {
            return ruleBuilder.SetValidator(new MustOwnDegree<T>(entities, degreeId));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustOwnDegree<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> degreeId)
        {
            return ruleBuilder.SetValidator(new MustOwnDegree<T>(queryProcessor, degreeId));
        }
    }
}
