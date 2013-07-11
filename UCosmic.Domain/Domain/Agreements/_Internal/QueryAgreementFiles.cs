using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class QueryAgreementFiles
    {
        private static readonly string Public = QueryAgreements.Public;
        private static readonly string Protected = QueryAgreements.Protected;

        internal static AgreementFile ById(this IQueryable<AgreementFile> queryable, int id)
        {
            return queryable.SingleOrDefault(x => x.Id == id);
        }

        internal static IQueryable<AgreementFile> ByAgreementId(this IQueryable<AgreementFile> queryable, int agreementId)
        {
            return queryable.Where(x => x.AgreementId == agreementId);
        }

        internal static IQueryable<AgreementFile> VisibleTo(this IQueryable<AgreementFile> files, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (files == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            return files.VisibleTo(principal, ownedTenantIds);
        }

        internal static IQueryable<AgreementFile> VisibleTo(this IQueryable<AgreementFile> files, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (files == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (ownedTenantIds == null) throw new ArgumentNullException("ownedTenantIds");

            // when user is not an agreement admin, filter out files attached to private agreements
            // and protected agreements that the user does not own
            if (!principal.IsInAnyRole(RoleName.AgreementManagers))
            {
                return files.Where(x => Public.Equals(x.Agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    || (
                        Protected.Equals(x.Agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        &&
                        x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                )

                // additionally filter out private files and protected files that the user does not own
                .Where(x => Public.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    || (
                        Protected.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        &&
                        x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                );
            }

            // when user is an agreement admin, include all files attached to agreements they own
            return files.Where(x => Public.Equals(x.Agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)
                || (
                    x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
            )

            // additionally include files explicitly marked public, or which the user owns
            .Where(x => Public.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                || (
                    x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
            );
        }
    }
}
