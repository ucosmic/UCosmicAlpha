using System;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External
{
    public class UsfFacultyInfo
    {
        /* Faculty Information Sevice */
#if false // true for dev urls
        public const string CasUri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/login";
        private const string Uri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/facultyInfo";
#else
        public const string CasUri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/login";
        private const string Uri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/facultyInfo";
#endif

        private Stream _responseStream;

        public Stream Open(string casTicket, string usfNetId)
        {
            if (_responseStream != null)
            {
                return _responseStream;
            }

            string url = String.Format("{0}/{1}?ticket={2}", Uri, usfNetId, casTicket);
            var request = (HttpWebRequest)WebRequest.Create(url);

            request.Method = "GET";

            request.Timeout = 15000;
            var response = request.GetResponse();
            _responseStream = response.GetResponseStream();

            return _responseStream;
        }

        public void Close()
        {
            if (_responseStream == null)
            {
                return;
            }

            _responseStream.Close();
            _responseStream = null;
        }
    }
}
