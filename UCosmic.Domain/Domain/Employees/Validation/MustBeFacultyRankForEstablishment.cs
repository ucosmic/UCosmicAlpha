using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Employees
{
    public class MustBeFacultyRankForEstablishment<T> : PropertyValidator
    {
        private const string FailMessageFormat = "Faculty Rank '{PropertyValue}' is not accessible from establishment '{EstablishmentId}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;

        internal MustBeFacultyRankForEstablishment(IProcessQueries queryProcessor, Func<T, int> establishmentId)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (establishmentId == null) throw new ArgumentNullException("establishmentId");
            _queryProcessor = queryProcessor;
            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var facultyRankId = (int)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);

            var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(establishmentId)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.FacultyRanks,
                },
            });
            var entity = settings != null ? settings.FacultyRanks.FirstOrDefault(x => x.Id == facultyRankId) : null;
            if (entity == null)
            {
                context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
                context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
                return false;
            }
            return true;
        }
    }

    public static class MustBeFacultyRankForEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeFacultyRankForEstablishment<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustBeFacultyRankForEstablishment<T>(queryProcessor, establishmentId));
        }
    }
}
