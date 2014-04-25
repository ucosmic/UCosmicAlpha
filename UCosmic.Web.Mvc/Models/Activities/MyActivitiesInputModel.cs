using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class MyActivitiesInputModel
    {
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public static class MyActivitySearchInputProfiler
    {
        public class EntityToQuery : Profile
        {
            protected override void Configure()
            {
                var defaultOrderBy = new Dictionary<Expression<Func<ActivityValues, object>>, OrderByDirection>();
                CreateMap<MyActivitiesInputModel, ActivityValuesPageBy>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.EstablishmentId, o => o.UseValue(null))
                    .ForMember(d => d.AncestorId, o => o.UseValue(null))
                    .ForMember(d => d.EstablishmentDomain, o => o.UseValue(null))
                    .ForMember(d => d.CountryCode, o => o.UseValue(null))
                    .ForMember(d => d.PlaceIds, o => o.UseValue(null))
                    .ForMember(d => d.ActivityTypeIds, o => o.UseValue(null))
                    .ForMember(d => d.Since, o => o.UseValue(null))
                    .ForMember(d => d.Until, o => o.UseValue(null))
                    .ForMember(d => d.IncludeUndated, o => o.UseValue(null))
                    .ForMember(d => d.Keyword, o => o.UseValue(null))
                    .ForMember(d => d.OrderBy, o => o.UseValue(defaultOrderBy.Recency(OrderByDirection.Descending)))
                ;
            }
        }

    }
}