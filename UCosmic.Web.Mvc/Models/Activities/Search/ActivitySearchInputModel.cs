using System;
using System.Collections.Generic;
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
        }

        public ActivitySearchPivot Pivot { get; set; }
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
    }

    public static class ActivitySearchInputProfiler
    {
        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivitySearchInputModel, ActivityValuesPageByTerms>()
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentDomain, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

                    // map the country code
                    .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
                    {
                        // a country code value of null implies finding results without a country code
                        if (s.CountryCode == "-1" || "none".Equals(s.CountryCode, StringComparison.OrdinalIgnoreCase)) return null;

                        // a country code value of "" implies finding all results regardless of country code
                        return "any".Equals(s.CountryCode, StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(s.CountryCode)
                            ? string.Empty : s.CountryCode;
                    }))

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
                            var otherDirection = "asc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                                ? OrderByDirection.Descending : OrderByDirection.Ascending;

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
                                    // note that "desc" here means most recent will come at the top (they have the most recency, descending to less recent activities)
                                    // this puts all ongoings at the top when most recent, at bottom when least recent
                                    orderBy.Add(x => x.OnGoing, direction);

                                    // sort by year descending. Year comes from end date first, or start date if end date is null, or int.MinValue if start date is null
                                    // this will group the list by year descending, essentially creating 1 sort group for each coalesced year
                                    orderBy.Add(x => x.EndsOn.HasValue
                                        ? x.EndsOn.Value.Year
                                        : x.StartsOn.HasValue
                                            ? x.StartsOn.Value.Year
                                            : int.MinValue, direction);

                                    // activities that have both a start date & end date in same year come at the top (true above false)
                                    orderBy.Add(x => x.StartsOn.HasValue && x.EndsOn.HasValue && x.StartsOn.Value.Year == x.EndsOn.Value.Year, direction);

                                    // activities that have both start & end come at bottom (true below false) because they will not be in same year
                                    // after the sort expression above puts ones in same year at the top
                                    orderBy.Add(x => x.EndsOn.HasValue && x.StartsOn.HasValue, otherDirection);

                                    // so far all date sorting has been by year: use this to also sort by month & day descending
                                    orderBy.Add(x => x.EndsOn ?? x.StartsOn, direction);

                                    // finally, sort by title alphabetically
                                    orderBy.Add(x => x.Title, OrderByDirection.Ascending);
                                    break;
                            }
                        }

                        if (!orderBy.Any())
                            orderBy.Add(x => x.RevisionId, OrderByDirection.Ascending);

                        return orderBy;
                    }))
                ;
            }
        }
    }
}