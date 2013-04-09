using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    internal static class QueryActivities
    {
        internal static IQueryable<Activity> WithPersonId(this IQueryable<Activity> queryable, int personId)
        {
            queryable = queryable.Where(a => a.PersonId == personId);
            return queryable;
        }
        
        internal static IQueryable<Activity> WithUserName(this IQueryable<Activity> queryable, string userName)
        {
            return queryable.Where(
                a =>
                a.Person.User != null &&
                a.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase)
            );
        }

        internal static Activity ByUserNameAndNumber(this IQueryable<Activity> queryable,
                                                     string modeText,
                                                     string userName,
                                                     int number)
        {
            return queryable.SingleOrDefault(
                a =>
                a.ModeText == modeText &&
                a.Person.User != null &&
                a.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase) &&
                a.Number == number
            );
        }

        internal static Activity ByEntityId(this IQueryable<Activity> queryable, int id)
        {
            return queryable.SingleOrDefault(
                a =>
                a.RevisionId == id 
            );
        }

        internal static IQueryable<Activity> WithTenant(this IQueryable<Activity> queryable, object tenant)
        {
            var tenantId = tenant as int?;
            var tenantGuid = tenant as Guid?;
            var tenantUrl = tenant as string;

            if (tenantGuid.HasValue && tenantGuid != Guid.Empty)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.EntityId.Equals(tenantGuid)
                    )
                );
            }

            if (tenantId.HasValue)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.RevisionId.Equals(tenantId)
                    )
                );
            }

            if (tenantUrl != null)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.Urls.Any
                        (
                            u =>
                            u.Value.Equals(tenantUrl, StringComparison.OrdinalIgnoreCase)
                        )
                    )
                );
            }

            throw new NotSupportedException(string.Format("Value of tenant '{0}' was of an unsupported type ({1}).", 
                tenant, tenant != null ? tenant.GetType().Name : "null"));
        }

        internal static IQueryable<Activity> WithMode(this IQueryable<Activity> queryable, string modeText)
        {
            return string.IsNullOrWhiteSpace(modeText) ? queryable : queryable.Where(a => a.ModeText == modeText);
        }

        internal static IQueryable<Activity> WithKeyword(this IQueryable<Activity> queryable, string modeText, string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return queryable;

            return queryable.Where(
                a =>
                a.ModeText == modeText &&
                a.Values.First(x => x.Mode == ActivityMode.Public).Title.Contains(keyword) ||
                a.Person.DisplayName.Contains(keyword) // ||
                //a.Tags.Any
                //(
                //    t =>
                //    t.ModeText == modeText &&
                //    t.Text.Contains(keyword)
                //)
            );
        }
    }
}
