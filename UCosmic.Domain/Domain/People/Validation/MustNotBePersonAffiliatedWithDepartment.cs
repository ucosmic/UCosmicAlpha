using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustNotBePersonAffiliatedWithDepartment<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Person '{0}' is already affiliated with department '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _establishmentId;
        private readonly Func<T, int?> _campusId;
        private readonly Func<T, int?> _collegeId;
        private readonly Func<T, int?> _departmentId;


        internal MustNotBePersonAffiliatedWithDepartment( IQueryEntities entities,
                                                          Func<T, int> establishmentId,
                                                          Func<T, int?> campusId,
                                                          Func<T, int?> collegeId,
                                                          Func<T, int?> departmentId)

            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{EstablishmentId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            _establishmentId = establishmentId;
            _campusId = campusId;
            _collegeId = collegeId;
            _departmentId = departmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            var personId = (int)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);
            var campusId = _campusId((T)context.Instance);
            var collegeId = _collegeId((T)context.Instance);
            var departmentId = _departmentId((T)context.Instance);

            context.MessageFormatter.AppendArgument("PropertyValue", personId);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
            context.MessageFormatter.AppendArgument("CampusId", campusId);
            context.MessageFormatter.AppendArgument("CollegeId", collegeId);
            context.MessageFormatter.AppendArgument("DepartmentId", departmentId);

            //return entity != null && entity.GetAffiliation(establishmentId) == null;
            var entity = _entities.Query<Affiliation>().SingleOrDefault(x =>
                x.PersonId == personId &&
                x.EstablishmentId == establishmentId &&
                x.CampusId == campusId &&
                x.CollegeId == collegeId &&
                x.DepartmentId == departmentId );

            return entity == null;
        }
    }

    public static class MustNotBePersonAffiliatedWithDepartmentExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBePersonAffiliatedWithDepartment<T>
            ( this IRuleBuilder<T, int> ruleBuilder,
              IQueryEntities entities,
              Func<T, int> establishmentId,
              Func<T, int?> campusId,
              Func<T, int?> collegeId,
              Func<T, int?> departmentId
            )
        {
            return ruleBuilder.SetValidator(new MustNotBePersonAffiliatedWithDepartment<T>( entities,
                                                                                            establishmentId,
                                                                                            campusId,
                                                                                            collegeId,
                                                                                            departmentId ));
        }
    }
}
