using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using LinqKit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    internal static class QueryAgreements
    {
        internal static Agreement ById(this IQueryable<Agreement> queryable, int id)
        {
            return queryable.SingleOrDefault(x => x.Id == id);
        }

        internal static IQueryable<Agreement> ByOwnerDomain(this IQueryable<Agreement> agreements, string domain)
        {
            if (agreements == null) return null;
            if (string.IsNullOrWhiteSpace(domain)) return agreements;

            var domains = new List<string> { domain.ToLower() };
            if (!domain.Equals("default", StringComparison.OrdinalIgnoreCase)
                && !domain.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
                domains.Add(string.Format("www.{0}", domain));

            return agreements.Where(x => x.Participants.Any(y => y.IsOwner
                    && (
                        (y.Establishment.WebsiteUrl != null && domains.Contains(y.Establishment.WebsiteUrl))
                        ||
                        (y.Establishment.Ancestors.Any(z => domains.Contains(z.Ancestor.WebsiteUrl)))
                    )
                ));
        }

        internal static IQueryable<Agreement> VisibleTo(this IQueryable<Agreement> agreements, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (agreements == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            return agreements.VisibleTo(principal, ownedTenantIds);
        }

        internal static IQueryable<Agreement> VisibleTo(this IQueryable<Agreement> agreements, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (agreements == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");

            var publicText = AgreementVisibility.Public.AsSentenceFragment();
            var protectedText = AgreementVisibility.Protected.AsSentenceFragment();

            // when user is not an agreement admin, filter out private agreements
            // and protected agreements that the user does not own
            if (!principal.IsInAnyRole(RoleName.AgreementManagers))
            {
                return agreements.Where(x => publicText.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    || (
                        protectedText.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        &&
                        x.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                );
            }

            // when user is an agreement admin, include all agreements they own
            return agreements.Where(x => publicText.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                || (
                    x.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
            );
        }

        internal static IQueryable<Agreement> IsRoot(this IQueryable<Agreement> queryable)
        {
            return queryable.Where(a => a.Umbrella == null);
        }

        internal static IQueryable<Agreement> WithAnyChildren(this IQueryable<Agreement> queryable)
        {
            return queryable.Where(a => a.Children.Any());
        }

        internal static IQueryable<Agreement> OwnedByEstablishment(this IQueryable<Agreement> queryable, object establishmentKey)
        {
            queryable = queryable.Where(IsOwnedBy(establishmentKey));
            return queryable;
        }

        private static Expression<Func<Agreement, bool>> IsOwnedBy(object establishmentKey)
        {
            #region where participant owns the agreement, and id matches participant or one of its ancestors

            if (establishmentKey is int)
                return
                    agreement =>
                    agreement.Participants.Any
                    (
                        participant =>
                        participant.IsOwner // participant owns the agreement, and
                        &&
                        (
                            // either the participant id matches,
                            participant.Establishment.RevisionId == (int)establishmentKey
                            ||
                            // or the participant has ancestors whose id matches
                            participant.Establishment.Ancestors.Any
                            (
                                hierarchy =>
                                hierarchy.Ancestor.RevisionId == (int)establishmentKey
                            )
                        )
                    );
            if (establishmentKey is Guid)
                return
                    agreement =>
                    agreement.Participants.Any
                    (
                        participant =>
                        participant.IsOwner // participant owns the agreement, and
                        &&
                        (
                            // either the participant id matches,
                            participant.Establishment.EntityId == (Guid)establishmentKey
                            ||
                            // or the participant has ancestors whose id matches
                            participant.Establishment.Ancestors.Any
                            (
                                hierarchy =>
                                hierarchy.Ancestor.EntityId == (Guid)establishmentKey
                            )
                        )
                    );
            var key = establishmentKey as string;
            if (key != null)
                return
                    agreement =>
                    agreement.Participants.Any
                    (
                        participant =>
                        participant.IsOwner // participant owns the agreement, and
                        &&
                        (
                            // either the participant id matches,
                            key.Equals(participant.Establishment.WebsiteUrl, StringComparison.OrdinalIgnoreCase)
                            ||
                            // or the participant has ancestors whose id matches
                            participant.Establishment.Ancestors.Any
                            (
                                hierarchy =>
                                key.Equals(hierarchy.Ancestor.WebsiteUrl, StringComparison.OrdinalIgnoreCase)
                            )
                        )
                    );
            throw new NotSupportedException(string.Format(
                "Establishment key type '{0}' was not expected.", establishmentKey.GetType()));

            #endregion
        }

        internal static IQueryable<Agreement> MatchingPlaceParticipantOrContact(this IQueryable<Agreement> queryable, string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return queryable;

            var matchesPlaceParticipantOrContact = NonOwnerPlaceNameMatches(keyword)
                .Or(ParticipantNameMatches(keyword))
                .Or(ContactMatches(keyword));

            return queryable.AsExpandable().Where(matchesPlaceParticipantOrContact);
        }

        private static Expression<Func<Agreement, bool>> NonOwnerPlaceNameMatches(string keyword)
        {
            var twoLetterIsoLanguageCode = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;

            #region where participant does not own the agreement, and the keyword matches a participant place name

            return
                agreement =>
                agreement.Participants.Any
                (
                    participant =>
                    !participant.IsOwner // participant does not own the agreement, and
                    &&
                    (
                        // either the participant has an official place name matching the keyword,
                        participant.Establishment.Location.Places.Any
                        (
                            place =>
                            place.OfficialName.Contains(keyword)
                        )
                        // or the participant has a translated place name matching the keyword in the user's language,
                        ||
                        participant.Establishment.Location.Places.Any
                        (
                            place =>
                            place.Names.Any
                            (
                                name =>
                                name.TranslationToLanguage != null
                                &&
                                name.TranslationToLanguage.TwoLetterIsoCode == twoLetterIsoLanguageCode
                                &&
                                name.Text.Contains(keyword)
                            )
                        )
                        // or the participant has a translated place name matching they keyword in the user's language, using only ASCII characters
                        ||
                        participant.Establishment.Location.Places.Any
                        (
                            place =>
                            place.Names.Any
                            (
                                name =>
                                name.TranslationToLanguage != null
                                &&
                                name.TranslationToLanguage.TwoLetterIsoCode == twoLetterIsoLanguageCode
                                &&
                                name.AsciiEquivalent != null
                                &&
                                name.AsciiEquivalent.Contains(keyword)
                            )
                        )
                    )
                );

            #endregion
        }

        private static Expression<Func<Agreement, bool>> ParticipantNameMatches(string keyword)
        {
            var twoLetterIsoLanguageCode = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;

            #region where participant name matches keyword

            return
                agreement =>
                agreement.Participants.Any
                (
                    participant =>
                    (
                        // either the participant has an official name matching the keyword,
                        participant.Establishment.OfficialName.Contains(keyword)
                        ||
                        // or the participant has a non-official name matching the keyword in the user's language,
                        participant.Establishment.Names.Any
                        (
                            name =>
                            name.TranslationToLanguage != null
                            &&
                            name.TranslationToLanguage.TwoLetterIsoCode == twoLetterIsoLanguageCode
                            &&
                            name.Text.Contains(keyword)
                        )
                        // or the participant has a non-official name matching the keyword in the user's language, using only ASCII characters
                        ||
                        participant.Establishment.Names.Any
                        (
                            name =>
                            name.TranslationToLanguage != null
                            &&
                            name.TranslationToLanguage.TwoLetterIsoCode == twoLetterIsoLanguageCode
                            &&
                            name.AsciiEquivalent != null
                            &&
                            name.AsciiEquivalent.Contains(keyword)
                        )
                    )
                );

            #endregion
        }

        private static Expression<Func<Agreement, bool>> ContactMatches(string keyword)
        {
            #region where contact matches keyword

            return agreement =>
                agreement.Contacts.Any
                (
                    contact =>
                        // contact display name matches the keyword,
                    contact.Person.DisplayName.Contains(keyword)
                    ||
                        // or contact first name matches the keyword,
                    (
                        contact.Person.FirstName != null
                        &&
                        contact.Person.FirstName.Contains(keyword)
                    )
                        // or contact last name matches the keyword,
                    ||
                    (
                        contact.Person.LastName != null
                        &&
                        contact.Person.LastName.Contains(keyword)
                    )
                );

            #endregion
        }
    }
}
