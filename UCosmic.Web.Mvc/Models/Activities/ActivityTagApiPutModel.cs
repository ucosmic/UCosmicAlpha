namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTagApiPutModel
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string DomainTypeText { get; set; }
        public int? DomainKey { get; set; }
    }
}