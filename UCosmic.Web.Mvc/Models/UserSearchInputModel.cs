using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Models
{
    public class UserSearchInputModel
    {
        public UserSearchInputModel()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public string Keyword { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public static class UserSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<UserSearchInputModel, MyUsersByKeyword>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<User, object>>, OrderByDirection>();
                        if (string.IsNullOrWhiteSpace(s.OrderBy))
                            orderBy.Add(e => e.RevisionId, OrderByDirection.Ascending);

                        else if (s.OrderBy.Equals("username-asc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Name, OrderByDirection.Ascending);
                        else if (s.OrderBy.Equals("username-desc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Name, OrderByDirection.Descending);

                        else if (s.OrderBy.Equals("lastname-asc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Person.LastName, OrderByDirection.Ascending);
                        else if (s.OrderBy.Equals("lastname-desc", StringComparison.OrdinalIgnoreCase))
                            orderBy.Add(e => e.Person.LastName, OrderByDirection.Descending);

                        return orderBy;
                    }))
                ;
            }
        }
    }
}