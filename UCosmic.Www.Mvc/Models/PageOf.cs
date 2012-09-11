using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;

namespace UCosmic.Www.Mvc.Models
{
    public class PageOf<TModel>
    {
        public PageOf()
        {
            Items = Enumerable.Empty<TModel>();
        }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public int PageIndex { get { return PageNumber - 1; } }
        public int ItemTotal { get; set; }
        public int PageCount { get { return (int)Math.Ceiling((double)ItemTotal / PageSize); } }

        public bool IsOutOfBounds { get { return PageNumber > PageCount; } }

        public int FirstIndex { get { return PageIndex * PageSize; } }
        public int FirstNumber { get { return FirstIndex + 1; } }
        public int LastIndex { get { return LastNumber - 1; } }
        public int LastNumber { get { return FirstIndex + Items.Count(); } }

        public IEnumerable<TModel> Items { get; set; }
    }

    public abstract class PagedQueryResultToPageOfItemsProfiler<TSource, TDestination> : Profile
    {
        protected override void Configure()
        {
            CreateMap<PagedQueryResult<TSource>, PageOf<TDestination>>();
        }
    }
}