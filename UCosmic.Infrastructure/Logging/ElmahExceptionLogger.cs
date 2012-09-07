using System;
using System.Diagnostics;
using System.IO;
using System.Net.Mail;
using Elmah;

namespace UCosmic.Logging
{
    public class ElmahExceptionLogger : ILogExceptions
    {
        private readonly string _from;
        private readonly string _to;

        public ElmahExceptionLogger(string from, string to)
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
                var writer = new StringWriter();
                var formatter = new ErrorMailHtmlFormatter();
                formatter.Format(writer, error);
                var message = new MailMessage(_from, _to)
                {
                    Subject = error.Message.Replace("\r", string.Empty).Replace("\n", string.Empty),
                    IsBodyHtml = true,
                    Body = writer.ToString(),
                };

                var client = new SmtpClient();
                client.Send(message);
            }
            catch (Exception ex)
            {
                Trace.WriteLine(string.Format("Failed to send Elmah exception email: {0}", ex.Message), "Error");
            }
        }
    }
}
