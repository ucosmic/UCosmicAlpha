using System;
using System.Collections.Generic;
using System.Web;

namespace UCosmic.Domain.People
{
    public class ConfirmEmailFormatters : IDefineQuery<IDictionary<string, string>>
    {
        internal ConfirmEmailFormatters(EmailConfirmation confirmation, string sendFromUrl)
        {
            if (confirmation == null) throw new ArgumentNullException("confirmation");
            if (sendFromUrl == null) throw new ArgumentException("Cannot be null or white space.", "sendFromUrl");
            Confirmation = confirmation;
            SendFromUrl = sendFromUrl;
        }

        public EmailConfirmation Confirmation { get; private set; }
        public string SendFromUrl { get; private set; }
    }

    public class HandleConfirmEmailFormattersQuery : IHandleQueries<ConfirmEmailFormatters, IDictionary<string, string>>
    {
        private readonly IManageConfigurations _configurationManager;

        public HandleConfirmEmailFormattersQuery(IManageConfigurations configurationManager)
        {
            _configurationManager = configurationManager;
        }

        public IDictionary<string, string> Handle(ConfirmEmailFormatters query)
        {
            var formatters = new Dictionary<string, string>
            {
                { "{EmailAddress}", query.Confirmation.EmailAddress.Value },
                { "{ConfirmationCode}", query.Confirmation.SecretCode },
                { "{ConfirmationUrl}", string.Format(_configurationManager.ConfirmEmailUrlFormat,
                    query.Confirmation.Token,
                    HttpUtility.UrlEncode(query.Confirmation.SecretCode))
                },
                { "{SendFromUrl}", string.Format("https://{0}{1}", _configurationManager.DeployedTo, query.SendFromUrl) }
            };

            return formatters;
        }
    }
}
