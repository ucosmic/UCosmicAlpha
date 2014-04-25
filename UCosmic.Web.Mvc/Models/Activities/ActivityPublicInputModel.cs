using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPublicInputModel : BaseSearchInputModel
    {
        public ActivityPublicInputModel()
        {
            ;
            OrderBy = "recency-desc";
        }
        public int PersonId { get; set; }
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
    }

    public static class ActivityPublicInputProfiler
    {
        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityPublicInputModel, ActivityValuesPageBy>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EstablishmentId, o => o.UseValue(null))
                    .ForMember(d => d.AncestorId, o => o.UseValue(null))
                    .ForMember(d => d.EstablishmentDomain, o => o.UseValue(null))
                    .ForMember(d => d.PlaceIds, o => o.UseValue(null))
                    .ForMember(d => d.ActivityTypeIds, o => o.UseValue(null))
                    .ForMember(d => d.Since, o => o.UseValue(null))
                    .ForMember(d => d.Until, o => o.UseValue(null))
                    .ForMember(d => d.IncludeUndated, o => o.UseValue(null))

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
                        if (string.IsNullOrWhiteSpace(s.OrderBy))
                        {
                            orderBy.Add(e => e.Title, OrderByDirection.Ascending);
                        }
                        else if (s.OrderBy.Contains("-"))
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
                                case "recency":
                                    // put drafts at the top when sorting by recency descending
                                    orderBy.Add(x => x.ModeText, otherDirection);
                                    orderBy.Recency(direction);
                                    break;
                            }
                        }

                        return orderBy;
                    }))
                ;
            }

        }
    }
}