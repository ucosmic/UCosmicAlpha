//using System.Diagnostics;
//using System.Text;

//namespace UCosmic.Domain.External
//{
//    public class SmtpTraceListener : TraceListener
//    {
//        private readonly IHandleCommands<SendEmailMessageCommand> _sendEmailHandler;
//        private readonly string _to;
//        private readonly string _subject;
//        private readonly StringBuilder _body;

//        public SmtpTraceListener(IHandleCommands<SendEmailMessageCommand> sendEmailHandler, string to, string subject)
//        {
//            _sendEmailHandler = sendEmailHandler;
//            _to = to;
//            _subject = subject;
//            _body = new StringBuilder();
//        }

//        public override void Write(string message)
//        {
//            _body.Append(message);
//        }

//        public override void WriteLine(string message)
//        {
//            _body.AppendLine(message);
//        }

//        public override void Flush()
//        {
//            base.Flush();

//            var command = new SendEmailMessageCommand
//            {
//                From = "system@ucosmic.com",
//                To = _to,
//                Subject = _subject,
//                Body = _body.ToString()
//            };

//            _sendEmailHandler.Handle(command);

//            _body.Clear();
//        }
//    }
//}
