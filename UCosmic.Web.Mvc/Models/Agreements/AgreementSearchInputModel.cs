using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq.Expressions;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementSearchInputModel : BaseSearchInputModel
    {
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public string TypeCode { get; set; }
        public string OrderBy { get; set; }
        public string Accept { get; set; }
    }

    public static class AgreementSearchInputProfiler
    {
        public class ModelToEntityQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementSearchInputModel, AgreementsByKeyword>()

                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.OwnerDomain, o => o.Ignore())
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

                    // map the type code
                    .ForMember(d => d.TypeCode, o => o.ResolveUsing(s =>
                    {
                        // a country code value of null implies finding results without a country code
                        if (s.TypeCode == "-1" || "none".Equals(s.TypeCode, StringComparison.OrdinalIgnoreCase)) return null;

                        // a country code value of "" implies finding all results regardless of country code
                        return "any".Equals(s.TypeCode, StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(s.TypeCode)
                            ? string.Empty : s.TypeCode;
                    }))
                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<Agreement, object>>, OrderByDirection>();
                        if (string.IsNullOrWhiteSpace(s.OrderBy))
                        {
                            orderBy.Add(e => e.Id, OrderByDirection.Ascending);
                        }
                        else if (s.OrderBy.Contains("-"))
                        {
                            var columnAndDirection = s.OrderBy.Split(new[] { '-' });
                            var column = columnAndDirection[0];
                            var direction = "desc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                                ? OrderByDirection.Descending : OrderByDirection.Ascending;

                            switch (column.ToLower())
                            {
                                case "start":
                                    orderBy.Add(x => x.StartsOn, direction);
                                    break;

                                case "expires":
                                    orderBy.Add(x => x.ExpiresOn, direction);
                                    break;

                                case "type":
                                    orderBy.Add(x => x.Type, direction);
                                    break;

                                case "status":
                                    orderBy.Add(x => x.Status, direction);
                                    break;

                                case "partner":
                                    // establishment translated name is derived as follows:
                                    // 1.) if the establishment has a non-former-name that is a translation to the current UI culture, use it.
                                    // 2.) if the establishment has a non-former-name that is a translation to English, use it.
                                    // 3.) otherwise, use the official name
                                    orderBy.Add(x => x.Participants.Any(y => !y.IsOwner), direction == OrderByDirection.Ascending ? OrderByDirection.Descending : OrderByDirection.Ascending);
                                    orderBy.Add(x => x.Participants.Any(y => !y.IsOwner)
                                        ? x.Participants.FirstOrDefault(y => !y.IsOwner).Establishment.Names.Any(y => !y.IsFormerName && y.TranslationToLanguage != null
                                            && y.TranslationToLanguage.TwoLetterIsoCode.Equals(CultureInfo.CurrentUICulture.TwoLetterISOLanguageName, StringComparison.OrdinalIgnoreCase))
                                            ? x.Participants.FirstOrDefault(y => !y.IsOwner).Establishment.Names.FirstOrDefault(y => !y.IsFormerName && y.TranslationToLanguage != null
                                                && y.TranslationToLanguage.TwoLetterIsoCode.Equals(CultureInfo.CurrentUICulture.TwoLetterISOLanguageName, StringComparison.OrdinalIgnoreCase)).Text
                                            : x.Participants.FirstOrDefault(y => !y.IsOwner).Establishment.Names.Any(y => !y.IsFormerName && y.TranslationToLanguage != null
                                                && y.TranslationToLanguage.TwoLetterIsoCode.Equals("en", StringComparison.OrdinalIgnoreCase))
                                                ? x.Participants.FirstOrDefault(y => !y.IsOwner).Establishment.Names.FirstOrDefault(y => !y.IsFormerName && y.TranslationToLanguage != null
                                                    && y.TranslationToLanguage.TwoLetterIsoCode.Equals("en", StringComparison.OrdinalIgnoreCase)).Text
                                                : x.Participants.FirstOrDefault(y => !y.IsOwner).Establishment.OfficialName
                                        : null
                                        
                                        , direction);
                                    break;

                                case "country":
                                    // put agreements without partners or without known partner countries at the bottom
                                    orderBy.Add(x => x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry)), OrderByDirection.Descending);

                                    // ordering by partner country, first narrow to partner participants
                                    orderBy.Add(x => x.Participants.Where(y => !y.IsOwner)
                                        // of those, get a list of the partner country names
                                        .SelectMany(y => y.Establishment.Location.Places.Where(z => z.IsCountry).Select(z => z.OfficialName))
                                        // sort the country names alphabetically A-Z then take the first
                                        .OrderBy(y => y).FirstOrDefault(), direction);

                                    break;
                            }
                        }

                        return orderBy;
                    }))
                ;
            }
        }

        //public class ModelToViewsQueryProfile : Profile
        //{
        //    protected override void Configure()
        //    {
        //        CreateMap<AgreementSearchInputModel, AgreementViewsByKeyword>()

        //            .ConstructUsing(s => new AgreementViewsByKeyword(s.MyDomain))

        //            // map the country code
        //            .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
        //            {
        //                // a country code value of null implies finding results without a country code
        //                if (s.CountryCode == "-1") return null;

        //                // a country code value of "" implies finding all results regardless of country code
        //                if (string.IsNullOrWhiteSpace(s.CountryCode)) return string.Empty;

        //                return s.CountryCode;
        //            }))

        //            // map the order by
        //            .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
        //                {
        //                    var orderBy = new Dictionary<Expression<Func<AgreementView, object>>, OrderByDirection>();
        //                    if (string.IsNullOrWhiteSpace(s.OrderBy))
        //                        orderBy.Add(e => e.Id, OrderByDirection.Ascending);

        //                    else if (s.OrderBy.Equals("country-asc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => (e.Participants.Any(x => !x.IsOwner && x.CountryName != null) ? e.Participants.FirstOrDefault(x => !x.IsOwner).CountryName : null), OrderByDirection.Ascending);
        //                    else if (s.OrderBy.Equals("country-desc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => (e.Participants.Any(x => !x.IsOwner && x.CountryName != null) ? e.Participants.FirstOrDefault(x => !x.IsOwner).CountryName : null), OrderByDirection.Descending);

        //                    else if (s.OrderBy.Equals("start-asc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.StartsOn, OrderByDirection.Ascending);
        //                    else if (s.OrderBy.Equals("start-desc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.StartsOn, OrderByDirection.Descending);

        //                    else if (s.OrderBy.Equals("expires-asc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.ExpiresOn, OrderByDirection.Ascending);
        //                    else if (s.OrderBy.Equals("expires-desc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.ExpiresOn, OrderByDirection.Descending);

        //                    else if (s.OrderBy.Equals("type-asc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.Type, OrderByDirection.Ascending);
        //                    else if (s.OrderBy.Equals("type-desc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.Type, OrderByDirection.Descending);

        //                    else if (s.OrderBy.Equals("status-asc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.Status, OrderByDirection.Ascending);
        //                    else if (s.OrderBy.Equals("status-desc", StringComparison.OrdinalIgnoreCase))
        //                        orderBy.Add(e => e.Status, OrderByDirection.Descending);

        //                    return orderBy;
        //                }))
        //        ;
        //    }
        //}
    }
}