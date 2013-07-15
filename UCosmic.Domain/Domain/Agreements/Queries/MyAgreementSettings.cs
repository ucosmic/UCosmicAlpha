using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementSettings : BaseEntityQuery<AgreementSettings>, IDefineQuery<AgreementSettings>
    {
        public MyAgreementSettings(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        internal bool IsWritable { get; set; }
    }

    public class HandleMyAgreementSettingsQuery : IHandleQueries<MyAgreementSettings, AgreementSettings>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _detachedEntities;

        public HandleMyAgreementSettingsQuery(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IQueryEntities detachedEntities
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _detachedEntities = detachedEntities;
        }

        public AgreementSettings Handle(MyAgreementSettings query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // make sure user is authorized to view settings
            if (!query.Principal.IsInAnyRole(RoleName.AgreementManagers))
                throw new InvalidOperationException(string.Format(
                    "User '{0}' does not have privileges to invoke this function.",
                        query.Principal.Identity.Name));

            // first, get the principal's affiliation
            var person = _queryProcessor.Execute(new MyPerson(query.Principal)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    p => p.Affiliations.Select(a => a.Establishment),
                },
            });

            // from person's default affiliation, determine establishment
            var settings = (query.IsWritable)
                ? _entities.Get<AgreementSettings>()
                : _detachedEntities.Query<AgreementSettings>();
            settings = settings.EagerLoad(_entities, query.EagerLoad)
                .Where(c =>
                    c.ForEstablishment != null &&
                    c.ForEstablishment.IsMember &&
                    (
                        c.ForEstablishmentId == person.DefaultAffiliation.EstablishmentId ||
                        c.ForEstablishment.Offspring.Select(a => a.OffspringId)
                            .Contains(person.DefaultAffiliation.EstablishmentId)
                    )
                )
                .OrderBy(new Dictionary<Expression<Func<AgreementSettings, object>>, OrderByDirection>
                {
                    { c => c.ForEstablishment.Ancestors.Count, OrderByDirection.Descending}
                })
            ;

            return settings.FirstOrDefault() ?? AgreementSettings.Default;
        }
    }
}
