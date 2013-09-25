using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementSearchInputModel : BaseSearchInputModel
    {
        public int? Id { get; set; }
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public string OrderBy { get; set; }
        public string[] TypeEnglishNames { get; set; }
    }

    public static class AgreementSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementSearchInputModel, AgreementViewsByKeyword>()

                    // map the country code
                    .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
                    {
                        // a country code value of null implies finding results without a country code
                        if (s.CountryCode == "-1") return null;

                        // a country code value of "" implies finding all results regardless of country code
                        if (string.IsNullOrWhiteSpace(s.CountryCode)) return string.Empty;

                        return s.CountryCode;
                    }))

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                        {
                            var orderBy = new Dictionary<Expression<Func<AgreementView, object>>, OrderByDirection>();
                            if (string.IsNullOrWhiteSpace(s.OrderBy))
                                orderBy.Add(e => e.Id, OrderByDirection.Ascending);

                            else if (s.OrderBy.Equals("country-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => (e.Participants.Any(x => !x.IsOwner && x.CountryName != null) ? e.Participants.FirstOrDefault(x => !x.IsOwner).CountryName : null), OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("country-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => (e.Participants.Any(x => !x.IsOwner && x.CountryName != null) ? e.Participants.FirstOrDefault(x => !x.IsOwner).CountryName : null), OrderByDirection.Descending);

                            else if (s.OrderBy.Equals("start-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.StartsOn, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("start-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.StartsOn, OrderByDirection.Descending);

                            else if (s.OrderBy.Equals("expires-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.ExpiresOn, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("expires-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.ExpiresOn, OrderByDirection.Descending);

                            else if (s.OrderBy.Equals("type-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.Type, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("type-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.Type, OrderByDirection.Descending);

                            else if (s.OrderBy.Equals("status-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.Status, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("status-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.Status, OrderByDirection.Descending);

                            return orderBy;
                        }))
                ;
            }
        }
    }
}