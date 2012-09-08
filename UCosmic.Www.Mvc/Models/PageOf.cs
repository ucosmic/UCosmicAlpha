using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Www.Mvc.Models
{
    public class PageOf<TModel>
    {
        public PageOf(int pageSize, int pageNumber, int itemTotal)
        {
            PageSize = pageSize;
            PageNumber = pageNumber;
            ItemTotal = itemTotal;
            Items = Enumerable.Empty<TModel>();
        }

        public int PageSize { get; private set; }
        public int PageNumber { get; private set; }
        public int PageIndex { get { return PageNumber - 1; } }
        public int ItemTotal { get; private set; }
        public int PageCount { get { return (int)Math.Ceiling((double)ItemTotal / PageSize); } }

        public bool IsOutOfBounds { get { return PageNumber > PageCount; } }

        public int FirstIndex { get { return PageIndex * PageSize; } }
        public int FirstNumber { get { return FirstIndex + 1; } }
        public int LastIndex { get { return LastNumber - 1; } }
        public int LastNumber { get { return FirstIndex + Items.Count(); } }

        public IEnumerable<TModel> Items { get; set; }
    }
}