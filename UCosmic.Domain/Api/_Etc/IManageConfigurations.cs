namespace UCosmic
{
    public interface IManageConfigurations
    {
        string DeployedTo { get; }

        string SamlRealServiceProviderEntityId { get; }
        string SamlRealCertificateThumbprint { get; }
        string SamlTestServiceProviderEntityId { get; }
        string SamlTestCertificateThumbprint { get; }

        string ConfirmEmailUrlFormat { get; }

        string DefaultMailFromAddress { get; }
        string DefaultMailFromDisplayName { get; }

        string DefaultMailReplyToAddress { get; }
        string DefaultMailReplyToDisplayName { get; }

        string[] EmergencyMailAddresses { get; }
        string MailInterceptAddresses { get; }

        string TestMailServer { get; }
        string TestMailInbox { get; }
    }
}