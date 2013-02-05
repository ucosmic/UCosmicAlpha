using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using AutoMapper;

namespace UCosmic.Web.Mvc.Models
{
    [DataContract(Namespace = "")]
    public class PageOf<TModel>
    {
        public PageOf()
        {
            Items = new List<TModel>();
        }

        [DataMember]
        public int PageSize { get; set; }

        [DataMember]
        public int PageNumber { get; set; }
        public int PageIndex { get { return PageNumber - 1; } }

        [DataMember]
        public int ItemTotal { get; set; }
        public int PageCount { get { return (int)Math.Ceiling((double)ItemTotal / PageSize); } }

        public bool IsOutOfBounds { get { return PageNumber > PageCount; } }

        public int FirstIndex { get { return PageIndex * PageSize; } }
        public int FirstNumber { get { return FirstIndex + 1; } }
        public int LastIndex { get { return LastNumber - 1; } }
        public int LastNumber { get { return FirstIndex + Items.Count(); } }

        [DataMember]
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