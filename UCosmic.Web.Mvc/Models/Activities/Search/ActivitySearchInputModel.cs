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
            PageNumber = 1;
            PageSize = 10;
        }

        public string Domain { get; set; }
        public ActivitySearchPivot Pivot { get; set; }
        public int[] PlaceIds { get; set; }
        public string[] PlaceNames { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public string Keyword { get; set; }
        public string Since { get; set; }
        public string Until { get; set; }
        public bool? IncludeUndated { get; set; }
        public int? AncestorId { get; set; }
        public int PageNumber {get; set;}
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
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
                    .ForMember(d => d.AncestorId, o => o.MapFrom(s => s.AncestorId))
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.CountryCode, o => o.Ignore())
                    .ForMember(d => d.PlaceIds, o => o.MapFrom(s => s.PlaceIds == null ? null : s.PlaceIds.Where(x => x > 0)))
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

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

                            }
                        }

                        if (!orderBy.Any())
                            orderBy.Add(x => x.RevisionId, OrderByDirection.Ascending);

                        return orderBy;
                    }))
                ;
                CreateMap<ActivitySearchInputModel, ActivityValuesBy>()
                    .ForMember(d => d.EstablishmentDomain, o => o.MapFrom(s => s.Domain))
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.AncestorId, o => o.MapFrom(s => s.AncestorId))
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.CountryCode, o => o.Ignore())
                    .ForMember(d => d.PlaceIds, o => o.MapFrom(s => s.PlaceIds == null ? null : s.PlaceIds.Where(x => x > 0)))
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

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