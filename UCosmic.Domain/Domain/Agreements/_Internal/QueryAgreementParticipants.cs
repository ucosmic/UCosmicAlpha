using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class QueryAgreementParticipants
    {
        private static readonly string Public = QueryAgreements.Public;
        private static readonly string Protected = QueryAgreements.Protected;

        internal static AgreementParticipant ById(this IQueryable<AgreementParticipant> queryable, int id)
        {
            return queryable.SingleOrDefault(x => x.Id == id);
        }

        internal static IQueryable<AgreementParticipant> ByAgreementId(this IQueryable<AgreementParticipant> queryable, int agreementId)
        {
            return queryable.Where(x => x.AgreementId == agreementId);
        }

        internal static IQueryable<AgreementParticipant> VisibleTo(this IQueryable<AgreementParticipant> participants, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (participants == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            return participants.VisibleTo(principal, ownedTenantIds);
        }

        internal static IQueryable<AgreementParticipant> VisibleTo(this IQueryable<AgreementParticipant> participants, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (participants == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (ownedTenantIds == null) throw new ArgumentNullException("ownedTenantIds");

            // when user is not an agreement admin, filter out participants attached to private agreements
            // and protected agreements that the user does not own
            if (!principal.IsInAnyRole(RoleName.AgreementManagers))
            {
                return participants.Where(x => Public.Equals(x.Agreement.VisibilityText)
                    || (
                        Protected.Equals(x.Agreement.VisibilityText)
                        &&
                        x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                );
            }

            // when user is an agreement admin, include all participants attached to agreements they own
            return participants.Where(x => x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId)));
        }
    }
}
