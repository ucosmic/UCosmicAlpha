namespace UCosmic.Configuration
{
    public enum AppSettingsKey
    {
        DeployedTo,

        GeoNamesUserName,
        GeoPlanetAppId,
        PlaceFinderConsumerKey,
        PlaceFinderConsumerSecret,

        SamlRealServiceProviderEntityId,
        SamlRealCertificateThumbprint,
        SamlTestServiceProviderEntityId,
        SamlTestCertificateThumbprint,

        ConfirmEmailUrlFormat,

        DefaultMailFromAddress,
        DefaultMailFromDisplayName,

        DefaultMailReplyToAddress,
        DefaultMailReplyToDisplayName,

        EmergencyMailAddresses,
        MailInterceptAddresses,

        TestMailServer,
        TestMailInbox,
    }
}