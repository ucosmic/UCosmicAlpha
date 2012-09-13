using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic
{
    public class PagedQueryResult<TEntity> : IEnumerable<TEntity>
    {
        public PagedQueryResult(IQueryable<TEntity> queryable, int pageSize = int.MaxValue, int pageNumber = 1)
        {
            PageSize = pageSize;
            PageNumber = pageNumber;
            ItemTotal = queryable.Count();

            // whenever the PageCount is greater than the PageNumber, reduce PageNumber, options are out of bounds
            if (PageNumber > PageCount && ItemTotal > 0) PageNumber = PageCount;

            if (PageIndex > 0)
                queryable = queryable.Skip(PageIndex * PageSize);

            if (PageSize > 0)
                queryable = queryable.Take(PageSize);

            Items = queryable.ToArray();
        }

        public IEnumerable<TEntity> Items { get; private set; }
        public int PageSize { get; private set; }
        public int PageNumber { get; private set; }
        public int PageIndex { get { return PageNumber - 1; } }
        public int ItemTotal { get; private set; }
        public int PageCount { get { return (int)Math.Ceiling(ItemTotal / (double)PageSize); } }
        public int FirstNumber { get { return FirstIndex + 1; } }
        public int FirstIndex { get { return PageIndex * PageSize; } }
        public int LastNumber { get { return LastIndex + 1; } }
        public int LastIndex { get { return FirstIndex + Items.Count(); } }

        public IEnumerator<TEntity> GetEnumerator()
        {
            return Items.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}