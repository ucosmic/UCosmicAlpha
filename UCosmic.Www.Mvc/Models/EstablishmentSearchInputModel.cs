namespace UCosmic.Www.Mvc.Models
{
    public class EstablishmentSearchInputModel
    {
        public EstablishmentSearchInputModel()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public string Keyword { get; set; }
        public string Country { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }
}