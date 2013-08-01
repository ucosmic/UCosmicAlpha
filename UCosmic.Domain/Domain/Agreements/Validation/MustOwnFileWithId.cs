using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustOwnFileWithId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement file with id '{0}' does not exist under agreement with id '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _fileId;

        internal MustOwnFileWithId(IQueryEntities entities, Func<T, int> fileId)
            : base(FailMessageFormat.Replace("{0}", "{FileId}").Replace("{1}", "{AgreementId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (fileId == null) throw new ArgumentNullException("fileId");
            _entities = entities;
            _fileId = fileId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var fileId = _fileId((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);
            context.MessageFormatter.AppendArgument("FileId", fileId);

            var entity = _entities.Query<AgreementFile>()
                .SingleOrDefault(x => x.Id == fileId && x.AgreementId == agreementId);

            return entity != null;
        }
    }

    public static class MustOwnFileWithIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustOwnFileWithId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> fileId)
        {
            return ruleBuilder.SetValidator(new MustOwnFileWithId<T>(entities, fileId));
        }
    }
}
