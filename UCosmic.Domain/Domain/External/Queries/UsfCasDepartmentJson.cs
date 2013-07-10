namespace UCosmic.Domain.External
{
    public class UsfCasDepartmentJson : IDefineQuery<string>
    {
        internal UsfCasDepartmentJson(string ticket)
        {
            Ticket = ticket;
        }

        internal string Ticket { get; private set; }
    }

    public class HandleUsfCasDepartmentJsonQuery : IHandleQueries<UsfCasDepartmentJson, string>
    {
        private readonly IConsumeHttp _httpConsumer;
        private const string ServiceUrlFormat = "https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/lookUpInfo?ticket={0}";
        private const int Timeout = 240000; // 4 minutes

        public HandleUsfCasDepartmentJsonQuery(IConsumeHttp httpConsumer)
        {
            _httpConsumer = httpConsumer;
        }

        public string Handle(UsfCasDepartmentJson query)
        {
            var serviceUrl = string.Format(ServiceUrlFormat, query.Ticket);
            var json = _httpConsumer.Download<string>(serviceUrl, Timeout);
            return json;
        }
    }
}
