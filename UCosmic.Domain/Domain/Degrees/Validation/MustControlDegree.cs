using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class MustControlDegree<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform this action on degree with id '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _degreeId;

        internal MustControlDegree(IProcessQueries queryProcessor, Func<T, int> degreeId)
            : base(FailMessageFormat.Replace("{0}", "{UserName}").Replace("{0}", "{DegreeId}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

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

            var degree = _queryProcessor.Execute(new DegreeById(degreeId));
            var tenantPersonIds = _queryProcessor.Execute(new MyPeople(principal)).Select(x => x.RevisionId);
            return degree != null && tenantPersonIds.Contains(degree.PersonId);
        }
    }

    public static class MustControlDegreeExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustControlDegree<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> degreeId)
        {
            return ruleBuilder.SetValidator(new MustControlDegree<T>(queryProcessor, degreeId));
        }
    }
}
