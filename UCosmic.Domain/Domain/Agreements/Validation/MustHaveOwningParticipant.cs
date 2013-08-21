using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MustHaveOwningParticipant<T> : PropertyValidator
    {
        public const string FailMessage = "Agreement must have at least one owning participant.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustHaveOwningParticipant(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessage)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IEnumerable<CreateParticipant>))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IEnumerable<CreateParticipant> properties", GetType().Name));

            var commands = (IEnumerable<CreateParticipant>)context.PropertyValue;
            var principal = _principal((T)context.Instance);

            // make sure user is tenant of one of the establishments
            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(principal));
            foreach (var command in commands)
                if (ownedTenantIds.Contains(command.EstablishmentId))
                    return true;

            return false;
        }
    }

    public static class MustHaveOwningParticipantExtensions
    {
        public static IRuleBuilderOptions<T, IEnumerable<CreateParticipant>> MustHaveOwningParticipant<T>
            (this IRuleBuilder<T, IEnumerable<CreateParticipant>> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustHaveOwningParticipant<T>(queryProcessor, principal));
        }
    }
}
