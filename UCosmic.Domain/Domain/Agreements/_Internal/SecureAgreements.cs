using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class SecureAgreements
    {
        internal static void ApplySecurity(this Agreement agreement, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (agreement == null) return;
            if (principal == null) throw new ArgumentNullException("principal");

            // determine whether user has public, protected, or private visibility for this agreement
            var userVisibility = AgreementVisibility.Public;
            if (ownedTenantIds != null)
            {
                // user has protected visibility when they own an agreement owner
                var owningParticipantIds = agreement.Participants.Where(x => x.IsOwner).Select(x => x.EstablishmentId);
                if (ownedTenantIds.Any(owningParticipantIds.Contains))
                    userVisibility = AgreementVisibility.Protected;

                // user has private visiblity when they have protected visibility and are in an agreement manager role
                if (userVisibility == AgreementVisibility.Protected && principal.IsInAnyRole(RoleName.AgreementManagers))
                    userVisibility = AgreementVisibility.Private;
            }

            const string privateData = "[Private Data]";
            switch (userVisibility)
            {
                case AgreementVisibility.Public:
                    // when user is public and agreement is not public, something went wrong
                    if (agreement.Visibility != AgreementVisibility.Public)
                        throw new InvalidOperationException(string.Format(
                            "User '{0}' is not authorized to view this agreement.", principal.Identity.Name));

                    // when user is public and agreement is public, obfuscate protected & private data
                    agreement.Notes = privateData;
                    agreement.IsAutoRenew = null;
                    agreement.ExpiresOn = DateTime.MinValue;
                    agreement.IsExpirationEstimated = false;
                    agreement.Status = privateData;
                    agreement.Contacts = new Collection<AgreementContact>();
                    agreement.Files = new Collection<AgreementFile>();
                    break;

                case AgreementVisibility.Protected:
                    // when user is protected and agreement is private, something went wrong
                    if (agreement.Visibility == AgreementVisibility.Private)
                        throw new InvalidOperationException(string.Format(
                            "User '{0}' is not authorized to view this agreement.", principal.Identity.Name));

                    // when user is protected and agreement is not private, hide private data
                    agreement.Status = privateData;
                    agreement.Notes = privateData;
                    break;
            }
        }

        internal static void ApplySecurity(this Agreement agreement, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (agreement == null) return;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            agreement.ApplySecurity(principal, ownedTenantIds);
        }

        internal static void ApplySecurity(this IEnumerable<Agreement> agreements, IPrincipal principal, IQueryable<int> ownedTenantIds)
        {
            if (agreements == null) return;
            if (principal == null) throw new ArgumentNullException("principal");

            foreach (var agreement in agreements)
                agreement.ApplySecurity(principal, ownedTenantIds);
        }

        internal static void ApplySecurity(this IEnumerable<Agreement> agreements, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (agreements == null) return;
            if (principal == null) throw new ArgumentNullException("principal");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            foreach (var agreement in agreements)
                agreement.ApplySecurity(principal, ownedTenantIds);
        }
    }
}