using System.Configuration;

namespace UCosmic.Configuration
{
    public class DotNetConfigurationManager : IManageConfigurations
    {
        public string DefaultMailFromAddress { get { return GetString(AppSettingsKey.DefaultMailFromAddress); } }
        public string DefaultMailFromDisplayName { get { return GetString(AppSettingsKey.DefaultMailFromDisplayName); } }

        public string DefaultMailReplyToAddress { get { return GetString(AppSettingsKey.DefaultMailReplyToAddress); } }
        public string DefaultMailReplyToDisplayName { get { return GetString(AppSettingsKey.DefaultMailReplyToDisplayName); } }

        public string EmergencyMailAddress { get { return GetString(AppSettingsKey.EmergencyMailAddress); } }
        public string MailInterceptAddress { get { return GetString(AppSettingsKey.MailInterceptAddress); } }

        private static string GetString(AppSettingsKey key) { return ConfigurationManager.AppSettings[key.ToString()]; }
    }
}