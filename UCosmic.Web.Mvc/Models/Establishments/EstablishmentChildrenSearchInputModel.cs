using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentChildrenSearchInputModel : BaseSearchInputModel
    {
        public string[] OrderBy { get; set; }
    }

    public static class EstablishmentChildrenSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentChildrenSearchInputModel, EstablishmentChildren>()
                    .ForMember(d => d.ParentEstablishmentId, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

                    // map the orderby's
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<Establishment, object>>, OrderByDirection>();
                        if (s.OrderBy != null && s.OrderBy.Any())
                        {
                            foreach (var property in s.OrderBy)
                            {
                                if ("rank-asc".Equals(property, StringComparison.OrdinalIgnoreCase))
                                {
                                    // nulls go at bottom (put falses below trues)
                                    orderBy.Add(x => x.VerticalRank.HasValue, OrderByDirection.Descending);
                                    orderBy.Add(x => x.VerticalRank, OrderByDirection.Ascending);
                                }
                                else if ("rank-desc".Equals(property, StringComparison.OrdinalIgnoreCase))
                                {
                                    // nulls go at top (put trues below falses)
                                    orderBy.Add(x => x.VerticalRank.HasValue, OrderByDirection.Ascending);
                                    orderBy.Add(x => x.VerticalRank, OrderByDirection.Descending);
                                }
                                else if ("name-asc".Equals(property, StringComparison.OrdinalIgnoreCase))
                                    orderBy.Add(x => x.OfficialName, OrderByDirection.Ascending);
                                else if ("name-desc".Equals(property, StringComparison.OrdinalIgnoreCase))
                                    orderBy.Add(x => x.OfficialName, OrderByDirection.Descending);
                            }
                        }
                        return orderBy;
                    }))
                ;
            }
        }
    }
}