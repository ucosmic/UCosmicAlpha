using System;
using AutoMapper;
using UCosmic.Domain.Activities;
namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPublicInputModel : BaseSearchInputModel
    {
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
    }

    public static class ActivityPublicInputProfiler
    {
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
                    ;
            }
        }
    }
}