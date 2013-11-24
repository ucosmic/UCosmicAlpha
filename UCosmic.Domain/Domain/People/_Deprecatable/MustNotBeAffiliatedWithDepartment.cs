//using System;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Security.Principal;
//using FluentValidation;
//using FluentValidation.Validators;
//using UCosmic.Domain.Establishments;
//using UCosmic.Domain.Identity;

//namespace UCosmic.Domain.People
//{
//    public class MustNotBeAffiliatedWithDepartment<T> : PropertyValidator
//    {
//        public const string FailMessagePersonIdFormat = "Person with id '{0}' is already affiliated with establishment '{1}'.";
//        public const string FailMessagePrincipalFormat = "You are already affiliated with '{0}'.";

//        private readonly IQueryEntities _entities;
//        private readonly Func<T, int> _establishmentId;
//        private readonly Func<T, int?> _campusId;
//        private readonly Func<T, int?> _collegeId;
//        private readonly Func<T, int?> _departmentId;


//        internal MustNotBeAffiliatedWithDepartment(IQueryEntities entities, Func<T, int> establishmentId, Func<T, int?> campusId, Func<T, int?> collegeId, Func<T, int?> departmentId)

//            : base("{Message}")
//        {
//            if (entities == null) throw new ArgumentNullException("entities");
//            _entities = entities;

//            _establishmentId = establishmentId;
//            _campusId = campusId;
//            _collegeId = collegeId;
//            _departmentId = departmentId;
//        }

//        protected override bool IsValid(PropertyValidatorContext context)
//        {

//            throw new NotSupportedException("Part of Affiliation Verticalization");

//            //if (!(context.PropertyValue is int) && !(context.PropertyValue is IPrincipal))
//            //    throw new NotSupportedException(string.Format(
//            //        "The {0} PropertyValidator can only operate on int and IPrincipal properties", GetType().Name));

//            //var principal = context.PropertyValue as IPrincipal;
//            //var personId = principal != null
//            //    ? _entities.Query<User>()
//            //        .EagerLoad(_entities, new Expression<Func<User, object>>[] { x => x.Person })
//            //        .Single(x => x.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase))
//            //        .Person.RevisionId
//            //    : (int)context.PropertyValue;

//            //var establishmentId = _establishmentId((T)context.Instance);
//            //var campusId = _campusId((T)context.Instance);
//            //var collegeId = _collegeId((T)context.Instance);
//            //var departmentId = _departmentId((T)context.Instance);

//            //var entity = _entities.Query<Affiliation>().SingleOrDefault(x =>
//            //    x.PersonId == personId &&
//            //    x.EstablishmentId == establishmentId &&
//            //    x.CampusId == campusId &&
//            //    x.CollegeId == collegeId &&
//            //    x.DepartmentId == departmentId);

//            //if (entity != null)
//            //{
//            //    var specificEstablishment = departmentId ?? collegeId ?? campusId ?? establishmentId;
//            //    var message = principal != null
//            //        ? string.Format(FailMessagePrincipalFormat, _entities.Query<Establishment>().Single(x => x.RevisionId == specificEstablishment).TranslatedName)
//            //        : string.Format(FailMessagePersonIdFormat, personId, specificEstablishment);
//            //    context.MessageFormatter.AppendArgument("Message", message);
//            //}

//            //return entity == null;
//        }
//    }

//    public static class MustNotBeAffiliatedWithDepartmentExtensions
//    {
//        public static IRuleBuilderOptions<T, IPrincipal> MustNotBeAffiliatedWithDepartment<T>(this IRuleBuilder<T, IPrincipal> ruleBuilder,
//              IQueryEntities entities, Func<T, int> establishmentId, Func<T, int?> campusId, Func<T, int?> collegeId, Func<T, int?> departmentId)
//        {
//            return ruleBuilder.SetValidator(new MustNotBeAffiliatedWithDepartment<T>(
//                entities, establishmentId, campusId, collegeId, departmentId));
//        }

//        //public static IRuleBuilderOptions<T, int> MustNotBeAffiliatedWithDepartment<T>(this IRuleBuilder<T, int> ruleBuilder,
//        //  IQueryEntities entities, Func<T, int> establishmentId, Func<T, int?> campusId, Func<T, int?> collegeId, Func<T, int?> departmentId)
//        //{
//        //    return ruleBuilder.SetValidator(new MustNotBeAffiliatedWithDepartment<T>(
//        //        entities, establishmentId, campusId, collegeId, departmentId));
//        //}
//    }
//}
