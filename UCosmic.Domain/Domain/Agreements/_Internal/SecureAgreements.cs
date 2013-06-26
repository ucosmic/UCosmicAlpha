using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class SecureAgreements
    {
        internal static Agreement ApplySecurity(this Agreement agreement, IPrincipal principal, IProcessQueries queryProcessor, User user = null)
        {
            if (agreement == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            // make sure user is authorized to view this data
            if (user == null || !principal.Identity.Name.Equals(user.Name, StringComparison.OrdinalIgnoreCase))
                user = principal.GetSecurityUser(queryProcessor);

            var userVisibility = AgreementVisibility.Public;
            if (user != null)
            {
                var defaultAffiliation = user.Person.DefaultAffiliation;
                var owningParticipantIds = agreement.Participants.Where(x => x.IsOwner).Select(x => x.Establishment.RevisionId);
                var ownedEstablishmentIds = defaultAffiliation.Establishment.Offspring.Select(x => x.OffspringId).ToList();
                ownedEstablishmentIds.Insert(0, defaultAffiliation.Establishment.RevisionId);

                // user has protected visibility when default affiliation is with
                // an owning participant or one of its ancestors
                if (ownedEstablishmentIds.Any(owningParticipantIds.Contains))
                    userVisibility = AgreementVisibility.Protected;

                if (userVisibility == AgreementVisibility.Protected &&
                    principal.IsInAnyRole(RoleName.AgreementManagers))
                    userVisibility = AgreementVisibility.Private;
            }

            const string privateData = "[Private Data]";
            switch (userVisibility)
            {
                case AgreementVisibility.Public:
                    // when user is public and agreement is not public, hide it
                    if (agreement.Visibility != AgreementVisibility.Public) return null;

                    // when user is public and agreement is public, obfuscate protected & private data
                    agreement.Notes = privateData;
                    agreement.IsAutoRenew = null;
                    agreement.ExpiresOn = DateTime.MinValue;
                    agreement.IsExpirationEstimated = false;
                    agreement.Status = privateData;
                    agreement.Contacts = null;
                    agreement.Files = null;
                    break;

                case AgreementVisibility.Protected:
                    // when user is protected and agreement is private, hide it
                    if (agreement.Visibility == AgreementVisibility.Private) return null;

                    // when user is protected and agreement is not private, hide private data
                    agreement.Status = privateData;
                    agreement.Notes = privateData;
                    break;
            }

            return agreement;
        }

        internal static IEnumerable<Agreement> ApplySecurity(this IEnumerable<Agreement> agreements, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (agreements == null) return null;
            var user = principal.GetSecurityUser(queryProcessor);
            var securedAgreements = new List<Agreement>();
            foreach (var agreement in agreements)
            {
                var securedAgreement = agreement.ApplySecurity(principal, queryProcessor, user);
                if (securedAgreement != null) securedAgreements.Add(securedAgreement);
            }
            return securedAgreements.ToArray();
        }

        private static User GetSecurityUser(this IPrincipal principal, IProcessQueries queryProcessor)
        {
            var user = queryProcessor.Execute(new UserByName(principal.Identity.Name)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations.Select(y => y.Establishment.Offspring),
                }
            });
            return user;
        }
    }
}