namespace UCosmic
{
    public interface IManageConfigurations
    {
        string DefaultMailFromAddress { get; }
        string DefaultMailFromDisplayName { get; }

        string DefaultMailReplyToAddress { get; }
        string DefaultMailReplyToDisplayName { get; }

        string[] EmergencyMailAddresses { get; }
        string MailInterceptAddress { get; }
    }
}