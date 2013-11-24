using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class UmbrellaOptions : BaseEntitiesQuery<Agreement>, IDefineQuery<Agreement[]>
    {
        public UmbrellaOptions(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class ValidateUmbrellaOptionsQuery : AbstractValidator<UmbrellaOptions>
    {
        public ValidateUmbrellaOptionsQuery()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
            ;
        }
    }

    public class HandleUmbrellaOptionsQuery : IHandleQueries<UmbrellaOptions, Agreement[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleUmbrellaOptionsQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public Agreement[] Handle(UmbrellaOptions query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var options = _entities.Query<Agreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .OwnedBy(query.Principal, _queryProcessor)
                .Where(x => x.Id != query.AgreementId && x.Ancestors.All(y => y.AncestorId != query.AgreementId))
                .OrderBy(query.OrderBy)
            ;

            return options.ToArray();
        }
    }
}
