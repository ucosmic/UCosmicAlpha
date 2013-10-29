namespace UCosmic.Web.Mvc.Models
{
    public class AgreementOwningTenant
    {
        public int Id { get; set; }
        public int? ParentId { get; set; }
        public string OfficialName { get; set; }
        public string WebsiteUrl { get; set; }
        public string StyleDomain { get; set; }
    }
}