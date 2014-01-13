namespace UCosmic.Web.Mvc.Models
{
    public class AutoCompleteNameInputModel
    {
        public AutoCompleteNameInputModel()
        {
            MaxResults = 10;
        }

        public string Terms { get; set; }
        public int MaxResults { get; set; }
        public int? Granularity { get; set; }
    }
}