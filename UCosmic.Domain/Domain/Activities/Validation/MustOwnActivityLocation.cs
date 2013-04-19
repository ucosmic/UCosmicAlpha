using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivityLocation<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on activity document #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _activityLocationId;

        internal MustOwnActivityLocation(IQueryEntities entities, Func<T, int> activityLocationId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _activityLocationId = activityLocationId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principle = (IPrincipal)context.PropertyValue;
            var activityDocumentId = _activityLocationId != null ? _activityLocationId((T)context.Instance) : (int?)null;

            var activity = _entities.Query<Activity>()
                                    .Where(x => x.Values.Any(
                                        y => y.Documents.Any(
                                            z => z.RevisionId == activityDocumentId)))
                                    .SingleOrDefault(w => w.Person.User.Name.Equals(principle.Identity.Name,
                                                     StringComparison.OrdinalIgnoreCase));

            return activity != null;
        }
    }

    public static class MustOwnActivityLocationExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivityLocation<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> activityLocationId)
        {
            return ruleBuilder.SetValidator(new MustOwnActivityLocation<T>(entities, activityLocationId));
        }
    }
}
