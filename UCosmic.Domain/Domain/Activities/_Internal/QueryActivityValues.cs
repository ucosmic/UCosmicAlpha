using System.Linq;

namespace UCosmic.Domain.Activities
{
    internal static class QueryActivityValues
    {
        internal static ActivityValues ById(this IQueryable<ActivityValues> queryable, int id, bool allowNull = true)
        {
            return allowNull
                ? queryable.SingleOrDefault(x => x.RevisionId == id)
                : queryable.Single(x => x.RevisionId == id);
        }

        internal static bool IsEmpty(this ActivityValues entity)
        {
            var isEmpty = true;
            isEmpty &= string.IsNullOrWhiteSpace(entity.Title);
            isEmpty &= string.IsNullOrWhiteSpace(entity.Content);
            isEmpty &= !entity.StartsOn.HasValue;
            isEmpty &= !entity.EndsOn.HasValue;
            isEmpty &= !entity.OnGoing.HasValue;
            isEmpty &= entity.Locations == null || entity.Locations.Count == 0;
            isEmpty &= entity.Types == null || entity.Types.Count == 0;
            isEmpty &= entity.Tags == null || entity.Tags.Count == 0;
            isEmpty &= entity.Documents == null || entity.Documents.Count == 0;
            isEmpty &= !entity.WasExternallyFunded.HasValue;
            isEmpty &= !entity.WasInternallyFunded.HasValue;
            return isEmpty;
        }
    }
}