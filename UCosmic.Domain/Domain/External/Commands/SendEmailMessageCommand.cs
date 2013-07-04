using System.Net.Mail;

namespace UCosmic.Domain.External
{
    public class SendEmailMessageCommand
    {
        public string From { get; set; }
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }

    public class HandleSendEmailMessageCommand : IHandleCommands<SendEmailMessageCommand>
    {
        private readonly ISendMail _mailSender;

        public HandleSendEmailMessageCommand(ISendMail mailSender)
        {
            _mailSender = mailSender;
        }

        public void Handle(SendEmailMessageCommand command)
        {
            var message = new MailMessage(command.From, command.To, command.Subject, command.Body);
            _mailSender.Send(message);
        }
    }
}
