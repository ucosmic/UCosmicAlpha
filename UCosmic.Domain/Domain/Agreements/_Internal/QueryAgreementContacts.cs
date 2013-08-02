using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class QueryAgreementContacts
    {
        private static readonly string Public = QueryAgreements.Public;
        private static readonly string Protected = QueryAgreements.Protected;

        internal static AgreementContact ById(this IQueryable<AgreementContact> queryable, int id)
        {
            return queryable.SingleOrDefault(x => x.Id == id);
        }

        internal static IQueryable<AgreementContact> ByAgreementId(this IQueryable<AgreementContact> queryable, int agreementId)
        {
            return queryable.Where(x => x.AgreementId == agreementId);
        }

        internal static IQueryable<AgreementContact> VisibleTo(this IQueryable<AgreementContact> contacts, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (contacts == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            return contacts.VisibleTo(principal, ownedTenantIds);
        }

        internal static IQueryable<AgreementContact> VisibleTo(this IQueryable<AgreementContact> contacts, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (contacts == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (ownedTenantIds == null) throw new ArgumentNullException("ownedTenantIds");

            // when user is not an agreement admin, filter out contacts attached to private agreements
            // and protected agreements that the user does not own
            if (!principal.IsInAnyRole(RoleName.AgreementManagers))
            {
                // user must always own the agreement in order to view contacts
                return contacts.Where(x => x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    && ( // additionally, the agreemnent must be public or protected
                        Public.Equals(x.Agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        ||
                        Protected.Equals(x.Agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    )
                );
            }

            // when user is an agreement admin, include all contacts attached to agreements they own
            return contacts.Where(x => x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId)));
        }
    }
}
