namespace UCosmic.Domain.Home
{
    public class HomeLink : Entity
    {
        public int Id { get; set; }
        public int HomeSectionId { get; protected internal set; }
        public virtual HomeSection HomeSection { get; protected internal set; }
        public string Url { get; set; }
        public string Text { get; set; }
    }
}
