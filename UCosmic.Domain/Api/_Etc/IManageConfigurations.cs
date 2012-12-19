namespace UCosmic
{
    public interface IManageConfigurations
    {
        string SamlRealServiceProviderEntityId { get; }
        string SamlRealCertificateThumbprint { get; }
        string SamlTestServiceProviderEntityId { get; }
        string SamlTestCertificateThumbprint { get; }

        string DefaultMailFromAddress { get; }
        string DefaultMailFromDisplayName { get; }

        string DefaultMailReplyToAddress { get; }
        string DefaultMailReplyToDisplayName { get; }

        string[] EmergencyMailAddresses { get; }
        string MailInterceptAddress { get; }
    }
}