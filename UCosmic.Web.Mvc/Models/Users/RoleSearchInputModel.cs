using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Models
{
    public class RoleSearchInputModel : BaseSearchInputModel
    {
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
    }

    public static class RoleSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<RoleSearchInputModel, RolesByKeyword>()

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<Role, object>>, OrderByDirection>();
                        if (string.IsNullOrWhiteSpace(s.OrderBy))
                            orderBy.Add(e => e.RevisionId, OrderByDirection.Ascending);

                        else if (s.OrderBy.Equals("name-asc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Name, OrderByDirection.Ascending);
                        else if (s.OrderBy.Equals("name-desc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Name, OrderByDirection.Descending);

                        return orderBy;
                    }))
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                ;
            }
        }
    }
}