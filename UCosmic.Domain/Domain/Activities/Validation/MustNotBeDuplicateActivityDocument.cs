using System;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustNotBeDuplicateActivityDocument<T> : PropertyValidator
    {
        private const string FailMessageFormat = "The file name '{NewFileName}' is not allowed because this activity already has a file with the same name. " + 
            "Please rename or delete the existing '{ExistingFileName}' first.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, string> _fileName;
        private readonly Func<T, int> _activityId;
        private readonly Func<T, ActivityMode?> _mode;
        private readonly Func<T, int> _documentId;

        internal MustNotBeDuplicateActivityDocument(IProcessQueries queryProcessor, Func<T, string> fileName,
            Func<T, int> activityId, Func<T, ActivityMode?> mode, Func<T, int> documentId = null)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (fileName == null) throw new ArgumentNullException("fileName");
            if (activityId == null) throw new ArgumentNullException("activityId");
            if (mode == null) throw new ArgumentNullException("mode");

            _queryProcessor = queryProcessor;
            _fileName = fileName;
            _activityId = activityId;
            _mode = mode;
            _documentId = documentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var title = (string) context.PropertyValue;
            var fileName = _fileName((T)context.Instance);
            var activityId = _activityId((T)context.Instance);
            var mode = _mode((T)context.Instance);
            var documentId = _documentId != null ? _documentId((T)context.Instance) : (int?)null;

            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Documents),
                },
            });

            var values = mode.HasValue
                ? activity.Values.Single(x => x.Mode == mode.Value)
                : activity.Values.Single(x => x.Mode == activity.Mode);

            var compareName = !string.IsNullOrWhiteSpace(title)
                ? string.Format("{0}{1}", title, Path.GetExtension(fileName)) : fileName;
            if (documentId.HasValue)
                compareName = string.Format("{0}{1}", title,
                    Path.GetExtension(values.Documents.Single(x => x.RevisionId == documentId.Value).FileName));

            var currentDocumentNames = values.Documents.Where(x => x.RevisionId != documentId)
                .Select(x => !string.IsNullOrWhiteSpace(x.Title)
                    ? string.Format("{0}{1}", x.Title, Path.GetExtension(x.FileName)) : x.FileName)
                .ToArray();

            if (currentDocumentNames.All(x => !x.Equals(compareName, StringComparison.OrdinalIgnoreCase))) return true;

            context.MessageFormatter.AppendArgument("NewFileName", compareName);
            context.MessageFormatter.AppendArgument("ExistingFileName", currentDocumentNames
                .First(x => x.Equals(compareName, StringComparison.OrdinalIgnoreCase)));
            return false;
        }
    }

    public static class MustNotBeDuplicateActivityDocumentExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeDuplicateActivityDocument<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queryProcessor, Func<T, string> fileName,
                Func<T, int> activityId, Func<T, ActivityMode?> mode, Func<T, int> documentId = null)
        {
            return ruleBuilder.SetValidator(new MustNotBeDuplicateActivityDocument<T>(queryProcessor, fileName, activityId, mode, documentId));
        }
    }
}
