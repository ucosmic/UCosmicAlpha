namespace UCosmic.Web.Mvc.Models
{
    public abstract class BaseSearchInputModel
    {
        protected BaseSearchInputModel()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }
}