namespace UCosmic.Www.Mvc.Models
{
    public class Tenancy
    {
        public string Domain { get; set; }
        public int? TenantId { get; set; }
        public int? PersonId { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; }
    }
}