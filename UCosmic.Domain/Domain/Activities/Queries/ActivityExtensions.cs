using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    internal static class ActivityExtensions
    {
        internal static string PublicActivityModeText = ActivityMode.Public.AsSentenceFragment();

        internal static IQueryable<Activity> ApplyDateRange(this IQueryable<Activity> queryable,
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
                                       //!a.EditSourceId.HasValue
                                       (a.Original == null)

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

                                    && a.Values.Any(v => (v.ModeText == PublicActivityModeText) &&

                                                         !(noUndated && (!v.StartsOn.HasValue &&
                                                                         (!v.OnGoing.HasValue || !v.OnGoing.Value) &&
                                                                         !v.EndsOn.HasValue)) &&

                                                         /* and */
                                                         (
                                                             /* On-going only. If OnGoing has value and true, do not check EndsOn, because
                                                              * user may have checked, then uncheck Ongoing and EndsOn is not necessarily null'd
                                                              * when OnGoing is set to false (unchecked).
                                                              */
                                                             (!v.StartsOn.HasValue &&
                                                              (v.OnGoing.HasValue && v.OnGoing.Value)) ||

                                                             /* End date only (with future flag) */
                                                             (!v.StartsOn.HasValue &&
                                                              (v.EndsOn.HasValue && (v.EndsOn.Value >= fromDate) &&
                                                               (includeFuture || (v.EndsOn < toDate))) &&
                                                              (!v.OnGoing.HasValue || !v.OnGoing.Value)) ||

                                                             /* Start date and on-going.  Do not check EndsOn. */
                                                             ((v.StartsOn.HasValue && (v.StartsOn.Value < toDate)) &&
                                                              (v.OnGoing.HasValue && v.OnGoing.Value)) ||

                                                             /* Start date only. */
                                                             ((v.StartsOn.HasValue &&
                                                               ((v.StartsOn.Value >= fromDate) &&
                                                                (v.StartsOn.Value < toDate))) &&
                                                              !v.EndsOn.HasValue &&
                                                              (!v.OnGoing.HasValue || !v.OnGoing.Value)) ||

                                                             /* Start date and end date (with future flag). */
                                                             ((v.StartsOn.HasValue && (v.StartsOn.Value >= fromDate))) &&
                                                             (v.EndsOn.HasValue &&
                                                              (includeFuture || (v.EndsOn < toDate))) &&
                                                             (!v.OnGoing.HasValue || !v.OnGoing.Value)
                                                         )
                                           )
                                   )
                );
        }
    }
}
