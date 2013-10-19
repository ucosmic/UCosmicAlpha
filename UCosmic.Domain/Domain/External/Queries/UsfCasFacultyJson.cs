namespace UCosmic.Domain.External
{
    public class UsfCasFacultyResponse : IDefineQuery<string>
    {
        internal UsfCasFacultyResponse(string ticket, string username)
        {
            Ticket = ticket;
            Username = username;
        }

        internal string Ticket { get; private set; }
        internal string Username { get; private set; }
        internal string NetId
        {
            get
            {
                var atIndex = Username.IndexOf('@');
                return atIndex > 0 ? Username.Substring(0, atIndex).Trim() : null;
            }
        }
    }

    public class HandleUsfCasFacultyResponseQuery : IHandleQueries<UsfCasFacultyResponse, string>
    {
        private readonly IConsumeHttp _httpConsumer;
        //private const string ServiceUrlFormat = "https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/facultyInfo/{0}?ticket={1}";
        private const string ServiceUrlFormat = "https://usfpro12.forest.usf.edu:8443/UcosmicSrvc/facultyInfo/{0}?ticket={1}";
        private const int Timeout = 240000; // 4 minutes

        public HandleUsfCasFacultyResponseQuery(IConsumeHttp httpConsumer)
        {
            _httpConsumer = httpConsumer;
        }

        public string Handle(UsfCasFacultyResponse query)
        {
            var serviceUrl = string.Format(ServiceUrlFormat, query.NetId, query.Ticket);
            var json = _httpConsumer.Download<string>(serviceUrl, Timeout);
            return json;
        }
    }
}
