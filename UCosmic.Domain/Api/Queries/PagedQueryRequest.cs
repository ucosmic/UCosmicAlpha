namespace UCosmic
{
    public class PagedQueryRequest
    {
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
        public int PageNumber { get { return PageIndex + 1; } set { PageIndex = value - 1; } }

        public static readonly PagedQueryRequest Unpaged = new PagedQueryRequest { PageSize = int.MaxValue, };
    }
}