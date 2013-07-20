using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustBeUploadedByPrincipal<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The file with id '{0}' was not uploaded by user '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeUploadedByPrincipal(IQueryEntities entities, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{PrincipalName}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is Guid) && !(context.PropertyValue is Guid?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on Guid properties", GetType().Name));

            var uploadId = (Guid?)context.PropertyValue;
            var principal = _principal != null ? _principal((T)context.Instance) : null;

            if (principal == null || string.IsNullOrWhiteSpace(principal.Identity.Name)) return false;

            // make sure principal uploaded the file
            var upload = _entities.Query<LooseFile>().Single(x => x.EntityId == uploadId);
            if (!principal.Identity.Name.Equals(upload.CreatedByPrincipal, StringComparison.OrdinalIgnoreCase))
            {
                context.MessageFormatter.AppendArgument("PropertyValue", uploadId);
                context.MessageFormatter.AppendArgument("PrincipalName", principal.Identity.Name);
                return false;
            }
            return true;
        }
    }

    public static class MustBeUploadedByPrincipalExtensions
    {
        public static IRuleBuilderOptions<T, Guid> MustBeUploadedByPrincipal<T>
            (this IRuleBuilder<T, Guid> ruleBuilder, IQueryEntities entities, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeUploadedByPrincipal<T>(entities, principal));
        }

        public static IRuleBuilderOptions<T, Guid?> MustBeUploadedByPrincipal<T>
        (this IRuleBuilder<T, Guid?> ruleBuilder, IQueryEntities entities, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeUploadedByPrincipal<T>(entities, principal));
        }
    }
}
