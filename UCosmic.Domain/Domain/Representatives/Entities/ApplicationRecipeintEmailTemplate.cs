namespace UCosmic.Domain.Representatives
{
    public class ApplicationRecipeintEmailTemplate : Entity
    {
        public string RecipientAddress { get; protected internal set; }
        public string EmailSubject { get; protected internal set; }
        public string EmailBody { get; protected internal set; }
    }
}
