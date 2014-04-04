using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchInputModel : BaseSearchInputModel
    {
        public ActivitySearchInputModel()
        {
            Pivot = ActivitySearchPivot.Activities;
            OrderBy = "recency-desc";
        }

        public string Domain { get; set; }
        public ActivitySearchPivot Pivot { get; set; }
        public int[] PlaceIds { get; set; }
        public string[] PlaceNames { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
        public string Since { get; set; }
        public string Until { get; set; }
        public bool? IncludeUndated { get; set; }
        public int? AncestorId { get; set; }
    }

    public static class ActivitySearchInputProfiler
    {
        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivitySearchInputModel, ActivityValuesPageBy>()
                    .ForMember(d => d.EstablishmentDomain, o => o.MapFrom(s => s.Domain))
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    //.ForMember(d => d.AncestorId, o => o.Ignore())
                    .ForMember(d => d.AncestorId, o => o.MapFrom(s => s.AncestorId))
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.CountryCode, o => o.Ignore())
                    .ForMember(d => d.PlaceIds, o => o.MapFrom(s => s.PlaceIds == null ? null : s.PlaceIds.Where(x => x > 0)))
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

                    // map the country code
                    //.ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
                    //{
                    //    // a country code value of null implies finding results without a country code
                    //    if (s.CountryCode == "-1" || "none".Equals(s.CountryCode, StringComparison.OrdinalIgnoreCase)) return null;

                    //    // a country code value of "" implies finding all results regardless of country code
                    //    return "any".Equals(s.CountryCode, StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(s.CountryCode)
                    //        ? string.Empty : s.CountryCode;
                    //}))

                    // map from strings to dates
                    .ForMember(d => d.Since, o => o.ResolveUsing(s => StringToDateTime(s.Since)))
                    .ForMember(d => d.Until, o => o.ResolveUsing(s => StringToDateTime(s.Until, true)))

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<ActivityValues, object>>, OrderByDirection>();
                        if (string.IsNullOrWhiteSpace(s.OrderBy) || !s.OrderBy.Contains("-"))
                        {
                            orderBy.Add(e => e.Title, OrderByDirection.Ascending);
                        }
                        else
                        {
                            var columnAndDirection = s.OrderBy.Split(new[] { '-' });
                            var column = columnAndDirection[0];
                            var direction = "desc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                                ? OrderByDirection.Descending : OrderByDirection.Ascending;
                            //var otherDirection = "asc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                            //    ? OrderByDirection.Descending : OrderByDirection.Ascending;

                            switch (column.ToLower())
                            {
                                case "title":
                                    orderBy.Add(x => x.Title, direction);
                                    break;
                                case "type":
                                    orderBy.Add(x => x.Types.Select(y => y.Type.Type)
                                        .OrderBy(y => y).FirstOrDefault(), direction);
                                    break;
                                case "location":
                                    orderBy.Add(x => x.Locations.Select(y => y.Place.OfficialName)
                                        .OrderBy(y => y).FirstOrDefault(), direction);
                                    break;
                                case "lastname":
                                    orderBy.Add(x => x.Activity.Person.LastName ?? x.Activity.Person.DisplayName, direction);
                                    break;
                                case "recency":
                                    orderBy.Recency(direction);
                                    break;
                                    //// note that "desc" here means most recent will come at the top (they have the most recency, descending to less recent activities)
                                    //// this puts all ongoings at the top when most recent, at bottom when least recent
                                    //orderBy.Add(x => x.OnGoing.HasValue
                                    //    ? x.OnGoing // need this to keep false ongoings from bubbling to the top
                                    //    : false, direction);

                                    //// sort by year descending. Year comes from end date first, or start date if end date is null, or int.MinValue if start date is null
                                    //// this will group the list by year descending, essentially creating 1 sort group for each coalesced year
                                    //orderBy.Add(x => x.EndsOn.HasValue
                                    //    ? x.EndsOn.Value.Year
                                    //    : x.StartsOn.HasValue
                                    //        ? x.StartsOn.Value.Year
                                    //        : int.MinValue, direction);

                                    //// activities that have both a start date & end date in same year come at the top (true above false)
                                    //// but remember, activities with only a start date are implied to have ended in the same year
                                    //orderBy.Add(x => x.StartsOn.HasValue && x.EndsOn.HasValue && x.StartsOn.Value.Year == x.EndsOn.Value.Year
                                    //    || (x.StartsOn.HasValue && !x.EndsOn.HasValue), direction);

                                    //// activities that have both start & end come at bottom (true below false) because they will not be in same year
                                    //// after the sort expression above puts ones in same year at the top
                                    //orderBy.Add(x => x.EndsOn.HasValue && x.StartsOn.HasValue && x.EndsOn.Value.Year != x.StartsOn.Value.Year, otherDirection);

                                    //// so far all date sorting has been by year: use this to also sort by month & day descending
                                    //orderBy.Add(x => x.EndsOn ?? x.StartsOn, direction);

                                    //// activities that have both start & end have already been sorted by end date
                                    //// within these, also need to sorty by start date
                                    //orderBy.Add(x => x.StartsOn.HasValue && x.EndsOn.HasValue ? x.StartsOn : (DateTime?)null, direction);

                                    //// finally, sort by title alphabetically
                                    //orderBy.Add(x => x.Title, OrderByDirection.Ascending);
                            }
                        }

                        if (!orderBy.Any())
                            orderBy.Add(x => x.RevisionId, OrderByDirection.Ascending);

                        return orderBy;
                    }))
                ;
            }

            private static DateTime? StringToDateTime(string value, bool until = false)
            {
                // date could be passed as yyyy, m/yyyy, or m/d/yyyy
                if (string.IsNullOrWhiteSpace(value)) return null;
                value = value.Trim();
                DateTime dateTime;
                if (DateTime.TryParse(value, CultureInfo.CurrentUICulture, DateTimeStyles.AdjustToUniversal, out dateTime))
                    return dateTime;
                int year;
                if (int.TryParse(value, out year))
                    if (year >= DateTime.MinValue.Year && year <= DateTime.MaxValue.Year)
                        return DateTime.ParseExact(value, "yyyy", CultureInfo.CurrentUICulture, DateTimeStyles.AdjustToUniversal);
                return null;
            }
        }
    }
}