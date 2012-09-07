using System;
using System.Diagnostics;
using System.IO;
using System.Net.Mail;
using System.Text;
using Elmah;

namespace UCosmic.Logging
{
    public class ElmahExceptionLogger : ILogExceptions
    {
        private readonly string _from;
        private readonly string[] _to;

        public ElmahExceptionLogger(string from, string[] to)
        {
            _from = from;
            _to = to;
        }

        public void Log(Exception exception)
        {
            var error = new Error(exception);

            // first try to post it to the Elmah log
            try
            {
                var log = ErrorLog.GetDefault(null);
                if (log != null)
                {
                    log.Log(error);
                }
            }
            catch (Exception ex)
            {
                Trace.WriteLine(string.Format("Failed to add exception to Elmah error logger: {0}", ex.Message), "Error");
            }

            // second try to send it via Elmah mail
            try
            {
                using (var smtpClient = new SmtpClient())
                {
                    foreach (var to in _to)
                    {
                        smtpClient.Send(GetMailMessage(exception, to));
                    }
                }
            }
            catch (Exception ex)
            {
                Trace.WriteLine(string.Format("Failed to send Elmah exception email: {0}", ex.Message), "Error");
            }
        }

        private MailMessage GetMailMessage(Exception exception, string to)
        {
            var error = new Error(exception);
            var subject = error.Message.Replace("\r", string.Empty).Replace("\n", string.Empty);
            var html = true;
            var body = "An error occurred.";
            try
            {
                var writer = new StringWriter();
                var formatter = new ErrorMailHtmlFormatter();
                formatter.Format(writer, error);
                body = writer.ToString();
            }
            catch(Exception)
            {
                // some exceptions may creep up before we have access to the html formatter
                html = false;
                var builder = new StringBuilder(body);
                builder.AppendLine();
                builder.AppendLine();
                builder.AppendLine(exception.Message);
                builder.AppendLine();
                builder.AppendLine(exception.StackTrace);
                body = builder.ToString();
            }
            return new MailMessage(_from, to)
            {
                Subject = subject,
                IsBodyHtml = html,
                Body = body,
            };
        }
    }
}
