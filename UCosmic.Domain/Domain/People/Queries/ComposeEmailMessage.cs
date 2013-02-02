using System;
using System.Collections.Generic;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class ComposeEmailMessage : IDefineQuery<EmailMessage>
    {
        public ComposeEmailMessage(EmailTemplate template, EmailAddress toEmailAddress)
        {
            if (template == null) throw new ArgumentNullException("template");
            if (toEmailAddress == null) throw new ArgumentNullException("toEmailAddress");
            Template = template;
            ToEmailAddress = toEmailAddress;
        }

        public EmailTemplate Template { get; private set; }
        public EmailAddress ToEmailAddress { get; private set; }
        public IDictionary<string, string> Formatters { get; set; }
    }

    public class HandleComposeEmailMessageQuery : IHandleQueries<ComposeEmailMessage, EmailMessage>
    {
        private readonly IManageConfigurations _configurationManager;

        public HandleComposeEmailMessageQuery(IManageConfigurations configurationManager)
        {
            _configurationManager = configurationManager;
        }

        public EmailMessage Handle(ComposeEmailMessage query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var message = new EmailMessage
            {
                // subject & body
                Subject = query.Template.SubjectFormat.FormatTemplate(query.Formatters),
                Body = query.Template.BodyFormat.FormatTemplate(query.Formatters),

                // from address (has failsafe from address)
                FromAddress = query.Template.FromAddress ??
                    _configurationManager.DefaultMailFromAddress ?? "no-reply@ucosmic.com",
                FromDisplayName = query.Template.FromDisplayName ??
                    _configurationManager.DefaultMailFromDisplayName,

                // reply-to address
                ReplyToAddress = query.Template.ReplyToAddress ??
                    _configurationManager.DefaultMailReplyToAddress,
                ReplyToDisplayName = query.Template.ReplyToDisplayName ??
                    _configurationManager.DefaultMailReplyToDisplayName,

                // to address
                ToAddress = query.ToEmailAddress.Value,
                ToPerson = query.ToEmailAddress.Person,
                Number = query.ToEmailAddress.Person.Messages.NextNumber(),

                FromEmailTemplate = query.Template.Name,
                ComposedOnUtc = DateTime.UtcNow,
            };

            return message;
        }
    }
}
