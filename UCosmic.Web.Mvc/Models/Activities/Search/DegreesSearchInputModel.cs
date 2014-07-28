using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Degrees;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreesSearchInputModel : BaseSearchInputModel
    {
        public DegreesSearchInputModel()
        {
            OrderBy = "lastname-asc";
        }

        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
        public int? AncestorId { get; set; }
    }

    public static class DegreesSearchInputProfiler
    {
        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<DegreesSearchInputModel, DegreesPageByTerms>()
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentDomain, o => o.Ignore())
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

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<Degree, object>>, OrderByDirection>();
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
                                case "lastname":
                                    orderBy.Add(x => x.Person.LastName ?? x.Person.DisplayName, direction);
                                    break;

                                case "country":
                                    orderBy.Add(x => x.Institution != null && x.Institution.Location.Places.Any(y => y.IsCountry), otherDirection);
                                    orderBy.Add(x => x.Institution != null
                                        ? x.Institution.Location.Places.Any(y => y.IsCountry)
                                            ? x.Institution.Location.Places.FirstOrDefault(y => y.IsCountry).OfficialName
                                            : null
                                        : null, direction);
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