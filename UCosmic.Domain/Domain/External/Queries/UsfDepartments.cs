using System;
using Newtonsoft.Json;

namespace UCosmic.Domain.External
{
    public class UsfDepartments : IDefineQuery<UsfDepartmentsData>
    {
        internal UsfDepartments(UsfFacultyProfileService service)
        {
            if (service == null) throw new ArgumentNullException("service");
            Service = service;
        }

        internal UsfFacultyProfileService Service { get; private set; }
        internal WorkReportBuilder ReportBuilder { get; set; }
    }

    public class HandleUsfDepartmentsQuery : IHandleQueries<UsfDepartments, UsfDepartmentsData>
    {
        private readonly IConsumeHttp _httpConsumer;
        private readonly IProcessQueries _queryProcessor;
        //private const string ServiceUrlFormat = "https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/lookUpInfo?ticket={0}";
        //private const string ServiceUrlFormat = "https://usfpro12.forest.usf.edu:8443/UcosmicSrvc/lookUpInfo?ticket={0}";
        private const int Timeout = 240000; // 4 minutes

        public HandleUsfDepartmentsQuery(IConsumeHttp httpConsumer, IProcessQueries queryProcessor)
        {
            _httpConsumer = httpConsumer;
            _queryProcessor = queryProcessor;
        }

        public UsfDepartmentsData Handle(UsfDepartments query)
        {
            if (query == null) throw new ArgumentNullException("query");
            var reportBuilder = query.ReportBuilder ?? new WorkReportBuilder("Get USF Departments Data");

            reportBuilder.Report("Getting USF CAS ticket");
            var ticket = _queryProcessor.Execute(new UsfCasTicket(query.Service));
            var serviceUrl = query.Service.DepartmentsUrl;
            if (string.IsNullOrWhiteSpace(ticket) || string.IsNullOrWhiteSpace(serviceUrl)) return null;

            reportBuilder.Report("Received USF CAS ticket '{0}' for URL format '{1}'.", ticket, serviceUrl);
            serviceUrl = string.Format(serviceUrl, ticket);
            reportBuilder.Report("Getting USF URL '{0}'.", serviceUrl);
            var json = _httpConsumer.Download<string>(serviceUrl, Timeout);
            reportBuilder.Report("Received JSON response from URL:");
            reportBuilder.Report(json);
            if (string.IsNullOrWhiteSpace(json)) return null;

            reportBuilder.Report("Deserializing JSON into CLR object.");
            var data = JsonConvert.DeserializeObject<UsfDepartmentsData>(json);
            return data;
        }
    }
}
