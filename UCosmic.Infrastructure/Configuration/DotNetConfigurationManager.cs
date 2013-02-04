using System.Configuration;
using System.Linq;

namespace UCosmic.Configuration
{
    public class DotNetConfigurationManager : IManageConfigurations
    {
        public string DeployedTo { get { return GetString(AppSettingsKey.DeployedTo); } }

        public string SamlRealServiceProviderEntityId { get { return GetString(AppSettingsKey.SamlRealServiceProviderEntityId); } }
        public string SamlRealCertificateThumbprint { get { return GetString(AppSettingsKey.SamlRealCertificateThumbprint); } }
        public string SamlTestServiceProviderEntityId { get { return GetString(AppSettingsKey.SamlTestServiceProviderEntityId); } }
        public string SamlTestCertificateThumbprint { get { return GetString(AppSettingsKey.SamlTestCertificateThumbprint); } }

        public string ConfirmEmailUrlFormat { get { return GetString(AppSettingsKey.ConfirmEmailUrlFormat); } }

        public string DefaultMailFromAddress { get { return GetString(AppSettingsKey.DefaultMailFromAddress); } }
        public string DefaultMailFromDisplayName { get { return GetString(AppSettingsKey.DefaultMailFromDisplayName); } }

        public string DefaultMailReplyToAddress { get { return GetString(AppSettingsKey.DefaultMailReplyToAddress); } }
        public string DefaultMailReplyToDisplayName { get { return GetString(AppSettingsKey.DefaultMailReplyToDisplayName); } }

        public string[] EmergencyMailAddresses { get { return GetStrings(AppSettingsKey.EmergencyMailAddresses, ';'); } }
        public string MailInterceptAddresses { get { return GetString(AppSettingsKey.MailInterceptAddresses); } }

        public string TestMailServer { get { return GetString(AppSettingsKey.TestMailServer); } }
        public string TestMailInbox { get { return GetString(AppSettingsKey.TestMailInbox); } }

        private static string GetString(AppSettingsKey key)
        {
            return ConfigurationManager.AppSettings[key.ToString()];
        }

        private static string[] GetStrings(AppSettingsKey key, char split)
        {
            return GetString(key).Split(split).Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();
        }
    }
}