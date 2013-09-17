using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    /*
     * NOTE: These extensions must be called within an
     * ActivityViewProjector.BeginReadView() ... ActivityViewProjector.EndReadView() context.
     *
     * See ActivityCountByEstablishmentId for an example.
     */
    internal static class QueryActivityViews
    {
        internal static IQueryable<ActivityView> ApplyDateRange(this IQueryable<ActivityView> queryable,
                                                                DateTime fromDate,
                                                                DateTime toDate,
                                                                Boolean noUndated = false,
                                                                Boolean includeFuture = false)
        {
            if (fromDate > toDate)
            {
                throw new ArgumentException("fromDate must be later than endDate");
            }

            return queryable.Where(a =>
                               (
                                   /* include undated activities? */

                                   /*
                                    *                 undated activity
                                    *                 0 1
                                    *  -------------------------------
                                    *  noUndated   0 |1 1
                                    *  flag        1 |1 0
                                    *
                                    *  NAND
                                    */

                                   !(noUndated && (!a.StartsOn.HasValue  &&
                                        (!a.OnGoing.HasValue || !a.OnGoing.Value) &&
                                        !a.EndsOn.HasValue)) &&

                                   /* and */
                                   (
                                       /* On-going only. If OnGoing has value and true, do not check EndsOn, because
                                        * user may have checked, then uncheck Ongoing and EndsOn is not necessarily null'd
                                        * when OnGoing is set to false (unchecked).
                                        */
                                       (!a.StartsOn.HasValue &&
                                        (a.OnGoing.HasValue && a.OnGoing.Value)) ||

                                       /* End date only (with future flag) */
                                       (!a.StartsOn.HasValue &&
                                        (a.EndsOn.HasValue && (a.EndsOn.Value >= fromDate) &&
                                            (includeFuture || (a.EndsOn < toDate))) &&
                                        (!a.OnGoing.HasValue || !a.OnGoing.Value)) ||

                                       /* Start date and on-going.  Do not check EndsOn. */
                                       ((a.StartsOn.HasValue && (a.StartsOn.Value < toDate)) &&
                                        (a.OnGoing.HasValue && a.OnGoing.Value)) ||

                                       /* Start date only. */
                                       ((a.StartsOn.HasValue &&
                                         ((a.StartsOn.Value >= fromDate) &&  (a.StartsOn.Value < toDate))) &&
                                        !a.EndsOn.HasValue && (!a.OnGoing.HasValue || !a.OnGoing.Value)) ||

                                       /* Start date and end date (with future flag). */
                                       ((a.StartsOn.HasValue && (a.StartsOn.Value >= fromDate))) &&
                                       (a.EndsOn.HasValue && (includeFuture || (a.EndsOn < toDate))) &&
                                       (!a.OnGoing.HasValue || !a.OnGoing.Value))
                               )
                );
        }
    }
}
