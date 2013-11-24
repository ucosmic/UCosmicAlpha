using System;
using Newtonsoft.Json;

namespace UCosmic.Domain.External
{
    public class UsfPerson : IDefineQuery<UsfPersonData>
    {
        internal UsfPerson(UsfFacultyProfileService service, string username)
        {
            if (service == null) throw new ArgumentNullException("service");
            Service = service;
            Username = username;
        }

        internal UsfFacultyProfileService Service { get; private set; }
        internal string Username { get; private set; }
        internal string NetId
        {
            get
            {
                var atIndex = Username.IndexOf('@');
                return atIndex > 0 ? Username.Substring(0, atIndex).Trim() : null;
            }
        }
        internal WorkReportBuilder ReportBuilder { get; set; }
    }

    public class HandleUsfPersonQuery : IHandleQueries<UsfPerson, UsfPersonData>
    {
        private readonly IConsumeHttp _httpConsumer;
        private readonly IProcessQueries _queryProcessor;
        //private const string ServiceUrlFormat = "https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/facultyInfo/{0}?ticket={1}";
        //private const string ServiceUrlFormat = "https://usfpro12.forest.usf.edu:8443/UcosmicSrvc/facultyInfo/{0}?ticket={1}";
        private const int Timeout = 240000; // 4 minutes

        public HandleUsfPersonQuery(IConsumeHttp httpConsumer, IProcessQueries queryProcessor)
        {
            _httpConsumer = httpConsumer;
            _queryProcessor = queryProcessor;
        }

        public UsfPersonData Handle(UsfPerson query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var reportBuilder = query.ReportBuilder ?? new WorkReportBuilder("Get USF Person Data");

            reportBuilder.Report("Getting USF CAS ticket");
            var ticket = _queryProcessor.Execute(new UsfCasTicket(query.Service) { ReportBuilder = reportBuilder, });
            var serviceUrl = query.Service.PersonUrl;
            if (string.IsNullOrWhiteSpace(ticket) || string.IsNullOrWhiteSpace(serviceUrl)) return null;

            reportBuilder.Report("Received USF CAS ticket '{0}' for URL format '{1}'.", ticket, serviceUrl);
            serviceUrl = string.Format(serviceUrl, query.NetId, ticket);
            reportBuilder.Report("Getting USF URL '{0}'.", serviceUrl);
            var json = _httpConsumer.Download<string>(serviceUrl, Timeout);
            reportBuilder.Report("Received JSON response from URL:");
            reportBuilder.Report(json);
            if (string.IsNullOrWhiteSpace(json)) return null;

            reportBuilder.Report("Deserializing JSON into CLR object.");
            var data = JsonConvert.DeserializeObject<UsfPersonData>(json);
            return data;
        }
    }
}
