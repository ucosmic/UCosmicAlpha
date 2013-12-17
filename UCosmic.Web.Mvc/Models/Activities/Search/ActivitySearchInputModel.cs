using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchInputModel : BaseSearchInputModel
    {
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
                CreateMap<ActivitySearchInputModel, ActivitiesByKeyword>()
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentDomain, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<ActivityValues, object>>, OrderByDirection>
                        {
                            { x => x.RevisionId, OrderByDirection.Ascending },
                        };
                        return orderBy;
                    }))
                ;
            }
        }
    }
}