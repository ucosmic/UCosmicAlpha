using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Activities;
using System.Collections;
namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPublicInputModel : BaseSearchInputModel
    {
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
    }

    public static class ActivityPublicInputProfiler
    {

        //private static IOrderedEnumerable<T> Order<T, TKey>(this IEnumerable<T> source, Func<T, TKey> selector, string ascending)
        //{
        // public static IOrderedEnumerable<TSource> OrderBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector, string isAscending)
        //{
        //    return isAscending == "asc" ? source.OrderBy(keySelector) : source.OrderByDescending(keySelector);
        //}

        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityPublicInputModel, ActivitiesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())
                    //.ForMember(d => d.Keyword, o => o.Ignore())

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

                            switch (column.ToLower())
                            {
                                case "title":
                                    orderBy.Add(x => x.Title, direction);
                                    break;
                                case "type":
                                    if (columnAndDirection[1] == "desc")
                                    {
                                        orderBy.Add(x => x.Types.Select(y => y.Type.Type)
                                            .OrderByDescending(y => y).FirstOrDefault(), direction);
                                    }
                                    else
                                    {
                                        orderBy.Add(x => x.Types.Select(y => y.Type.Type)
                                            .OrderBy(y => y).FirstOrDefault(), direction);
                                    }
                                    break;

                                case "country":
                                    if (columnAndDirection[1] == "desc")
                                    {
                                        orderBy.Add(x => x.Locations.Select(y => y.Place.OfficialName)
                                            .OrderByDescending(y => y).FirstOrDefault(), direction);
                                    }
                                    else
                                    {
                                        orderBy.Add(x => x.Locations.Select(y => y.Place.OfficialName)
                                            .OrderBy(y => y).FirstOrDefault(), direction);
                                    }
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