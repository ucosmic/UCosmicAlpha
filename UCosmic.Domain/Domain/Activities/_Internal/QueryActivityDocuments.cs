using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    internal static class QueryActivityDocuments
    {
        private static readonly string Public = QueryActivities.Public;
        private static readonly string Protected = QueryActivities.Protected;

        internal static ActivityDocument ById(this IQueryable<ActivityDocument> queryable, int id)
        {
            return queryable.SingleOrDefault(x => x.Id == id);
        }

        internal static IQueryable<ActivityDocument> ByActivityId(this IQueryable<ActivityDocument> queryable, int activityId)
        {
            return queryable.Where(x => x.ActivityId == activityId);
        }

        internal static IQueryable<ActivityDocument> VisibleTo(this IQueryable<ActivityDocument> files, IPrincipal principal, IProcessQueries queryProcessor)
        {
            if (files == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            var ownedTenantIds = queryProcessor.Execute(new MyOwnedTenantIds(principal));
            return files.VisibleTo(principal, ownedTenantIds);
        }

        internal static IQueryable<ActivityDocument> VisibleTo(this IQueryable<ActivityDocument> files, IPrincipal principal, IEnumerable<int> ownedTenantIds)
        {
            if (files == null) return null;
            if (principal == null) throw new ArgumentNullException("principal");
            if (ownedTenantIds == null) throw new ArgumentNullException("ownedTenantIds");

            // when user is not an activity admin, filter out files attached to private activitys
            // and protected activitys that the user does not own
            //if (!principal.IsInAnyRole(RoleName.ActivityManagers))
            //{
                return files.Where(x => Public.Equals(x.Activity.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    || (
                        Protected.Equals(x.Activity.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        &&
                        x.Activity.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                )

                // additionally filter out private files and protected files that the user does not own
                .Where(x => Public.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                    || (
                        Protected.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                        &&
                        x.Activity.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                    )
                );
            //}

            // when user is an activity admin, include all files attached to activitys they own
            return files.Where(x => Public.Equals(x.Activity.VisibilityText, StringComparison.OrdinalIgnoreCase)
                || (
                    x.Activity.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
            )

            // additionally include files explicitly marked public, or which the user owns
            .Where(x => Public.Equals(x.VisibilityText, StringComparison.OrdinalIgnoreCase)
                || (
                    x.Activity.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
            );
        }
    }
}
