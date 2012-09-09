using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UCosmic.Domain;

namespace UCosmic
{
    public class PagedQueryResult<TEntity> : IEnumerable<TEntity> where TEntity : Entity
    {
        public PagedQueryResult(IQueryable<TEntity> queryable, PagedQueryRequest request)
        {
            request = request ?? PagedQueryRequest.Unpaged;
            ItemTotal = queryable.Count();
            _request = request;

            // whenever the PageCount is greater than the PageNumber, reduce PageNumber, options are out of bounds
            if (PageNumber > PageCount) _request.PageNumber = PageCount;

            if (_request.PageIndex > 0)
                queryable = queryable.Skip(_request.PageIndex * _request.PageSize);

            if (_request.PageSize > 0)
                queryable = queryable.Take(_request.PageSize);

            ItemsCollection = queryable.ToArray();
        }

        private readonly PagedQueryRequest _request;
        private ICollection<TEntity> ItemsCollection { get; set; }
        public IEnumerable<TEntity> Items { get { return ItemsCollection; } }
        public int PageSize { get { return _request.PageSize; } }
        public int PageNumber { get { return _request.PageNumber; } }
        public int PageIndex { get { return _request.PageIndex; } }
        public int ItemTotal { get; private set; }
        public int PageCount { get { return (int)Math.Ceiling(ItemTotal / (double)PageSize); } }
        public int FirstNumber { get { return FirstIndex + 1; } }
        public int FirstIndex { get { return _request.PageIndex * PageSize; } }
        public int LastNumber { get { return LastIndex + 1; } }
        public int LastIndex { get { return FirstIndex + ItemsCollection.Count; } }

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