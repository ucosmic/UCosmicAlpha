using System;
using System.Collections.Specialized;

namespace UCosmic.Domain.External
{
    public class UsfCasTicket : IDefineQuery<string>
    {
        public UsfCasTicket(string username, string password)
        {
            Username = username;
            Password = password;
        }

        public string Username { get; private set; }
        public string Password { get; private set; }
    }

    public class HandleUsfCasTicketQuery : IHandleQueries<UsfCasTicket, string>
    {
        private readonly IConsumeHttp _httpConsumer;
        private const string TicketsUrl = "https://authtest.it.usf.edu:444/v1/tickets";
        private const string LoginUrl = "https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/login";
        private const int Timeout = 10000;
        private const int Retries = 2;

        public HandleUsfCasTicketQuery(IConsumeHttp httpConsumer)
        {
            _httpConsumer = httpConsumer;
        }

        public string Handle(UsfCasTicket query)
        {
            var ticketGrantingUrl = GetTicketGrantingUrl(query);

            var data = new NameValueCollection
            {
                { "service", LoginUrl },
            };

            // ticket responses should be fast, but can be unreliable. use a shorter timeout with retry.
            //var timeout = Int32.Parse(ConfigurationManager.AppSettings["UsfCASTGTTimeoutMS"]);
            var ticket = _httpConsumer.Upload<string>(ticketGrantingUrl, "POST", data, Timeout, Retries);
            return ticket;
        }

        private string GetTicketGrantingUrl(UsfCasTicket query)
        {
            var data = new NameValueCollection
            {
                { "username", query.Username },
                { "password", query.Password },
            };

            // ticket responses should be fast, but can be unreliable. use a shorter timeout with retry.
            //var timeout = Int32.Parse(ConfigurationManager.AppSettings["UsfCASTGTTimeoutMS"]);
            var ticketGrantingResource = _httpConsumer.Upload<string>(TicketsUrl, "POST", data, Timeout, Retries);
            return ExtractTicketGrantingUrl(ticketGrantingResource);
        }

        private static string ExtractTicketGrantingUrl(string ticketGrantingResource)
        {
            #region Sample Ticket Granting Resource Response
            /*
                * <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
                * <html>
                *  <head>
                *      <title>201 The request has been fulfilled and resulted in a new resource being created</title>
                * </head>
                * <body>
                *  <h1>TGT Created</h1>
                *  <form action="https://authtest.it.usf.edu:444/v1/tickets/TGT-1152-OBHag3uftwa4gbCNffGo0o5MHpwfNI7Le9UUruzrpt30MtJfeo-IMPERS" method="POST">
                *      Service:
                *      <input type="text" name="service" value=""><br>
                *      <input type="submit" value="Submit">
                *  </form>
                * </body>
                * </html>
            */
            #endregion

            const string pattern = "action=\"";
            var startIndex = ticketGrantingResource.IndexOf(pattern, StringComparison.Ordinal) + pattern.Length;
            var length = ticketGrantingResource.IndexOf("\"", startIndex, StringComparison.Ordinal) - startIndex;
            var tgtUrl = ticketGrantingResource.Substring(startIndex, length);
            return tgtUrl;
        }
    }
}
