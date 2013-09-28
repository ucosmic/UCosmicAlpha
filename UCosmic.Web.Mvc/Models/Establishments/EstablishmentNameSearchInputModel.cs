namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentNameSearchInputModel : BaseSearchInputModel
    {
        public string Keyword { get; set; }
        public StringMatchStrategy? KeywordMatchStrategy { get; set; }
    }
}