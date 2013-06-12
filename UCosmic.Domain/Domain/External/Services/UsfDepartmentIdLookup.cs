using System;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External.Services
{
    public class UsfDepartmentIdLookup
    {
        /* Department ID Lookup Sevice */
        public const string CasUri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/login";
        private const string Uri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/deptIdLookup";
        private Stream _stream;

        public Stream Open(string casTicket)
        {
            if (_stream != null)
            {
                return _stream;
            }

            string url = String.Format("{0}?ticket={1}", Uri, casTicket);
            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";

            request.Timeout = 15000;
            var response = request.GetResponse();
            _stream = response.GetResponseStream();

            return _stream;
        }

        public void Close()
        {
            if (_stream == null)
            {
                return;
            }

            _stream.Close();
            _stream = null;
        }
    }
}
