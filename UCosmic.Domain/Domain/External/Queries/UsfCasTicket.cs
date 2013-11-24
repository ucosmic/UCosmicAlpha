using System;
using System.Collections.Specialized;

namespace UCosmic.Domain.External
{
    public class UsfCasTicket : IDefineQuery<string>
    {
        internal UsfCasTicket(UsfFacultyProfileService service)
        {
            if (service == null) throw new ArgumentNullException("service");
            Service = service;
        }

        internal UsfFacultyProfileService Service { get; private set; }
        internal WorkReportBuilder ReportBuilder { get; set; }
    }

    public class HandleUsfCasTicketQuery : IHandleQueries<UsfCasTicket, string>
    {
        private readonly IConsumeHttp _httpConsumer;
        private const int Timeout = 10000;
        private const int Retries = 2;

        public HandleUsfCasTicketQuery(IConsumeHttp httpConsumer)
        {
            _httpConsumer = httpConsumer;
        }

        public string Handle(UsfCasTicket query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var reportBuilder = query.ReportBuilder ?? new WorkReportBuilder("Obtain USF CAS Ticket");

            var ticketGrantingUrl = GetTicketGrantingUrl(query, reportBuilder);
            var loginUrl = query.Service.LoginUrl;
            if (string.IsNullOrWhiteSpace(ticketGrantingUrl) || string.IsNullOrWhiteSpace(loginUrl))
                return null;

            var data = new NameValueCollection
            {
                { "service", loginUrl },
            };

            // ticket responses should be fast, but can be unreliable. use a 10 second timeout with retry.
            reportBuilder.Report("Posting login URL '{0}' to ticket granting URL {1}.", loginUrl, ticketGrantingUrl);
            var ticket = _httpConsumer.Upload<string>(ticketGrantingUrl, "POST", data, Timeout, Retries);
            reportBuilder.Report("Received USF CAS ticket '{0}'.", ticket);
            return ticket;
        }

        private string GetTicketGrantingUrl(UsfCasTicket query, WorkReportBuilder reportBuilder)
        {
            var username =  query.Service.Login;
            var password = query.Service.Password;
            var ticketUrl = query.Service.TicketUrl;

            reportBuilder.Report("Obtained username and password for ticket URL '{0}'.", ticketUrl);

            var data = new NameValueCollection
            {
                { "username", username },
                { "password", password },
            };

            // ticket responses should be fast, but can be unreliable. use a 10 second timeout with retry.
            reportBuilder.Report("Posting username and password to ticket URL.");
            var ticketGrantingResource = _httpConsumer.Upload<string>(ticketUrl, "POST", data, Timeout, Retries);
            reportBuilder.Report("Obtained ticket granting resource response:");
            reportBuilder.Report(ticketGrantingResource);
            reportBuilder.Report("Extracting ticket granting URL from ticket granting resource.");
            var ticketGrantingUrl = ExtractTicketGrantingUrl(ticketGrantingResource, reportBuilder);
            reportBuilder.Report("Obtained ticket granting URL '{0}' from ticket granting resource.", ticketGrantingUrl);
            return ticketGrantingUrl;
        }

        private static string ExtractTicketGrantingUrl(string ticketGrantingResource, WorkReportBuilder reportBuilder)
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
            reportBuilder.Report("Looking for string pattern '{0}' in ticket granting response.", pattern);
            var startIndex = ticketGrantingResource.IndexOf(pattern, StringComparison.Ordinal) + pattern.Length;
            reportBuilder.Report("Found matching string pattern at index '{0}'.", startIndex);
            reportBuilder.Report("Computing string length for the end of the URL pattern.");
            var length = ticketGrantingResource.IndexOf("\"", startIndex, StringComparison.Ordinal) - startIndex;
            reportBuilder.Report("Length of string for URL was computed to be '{0}'.", length);
            var tgtUrl = ticketGrantingResource.Substring(startIndex, length);
            reportBuilder.Report("Target URL to be used is '{0}'.", tgtUrl);
            return tgtUrl;
        }
    }
}
