using System;
using System.Configuration;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External
{
    public class UsfFacultyInfo
    {
        private Stream _responseStream;

        public static string CasUri
        {
            get { return ConfigurationManager.AppSettings["UsfCasLoginService"]; }
        }

        public Stream Open(string casTicket, string usfNetId)
        {
            if (_responseStream != null)
            {
                return _responseStream;
            }

            int atIndex = usfNetId.IndexOf('@');
            if (atIndex != -1)
            {
                usfNetId = usfNetId.Substring(0, atIndex).Trim();
            }

            if (usfNetId.Length == 0)
            {
                return null;
            }

            string uri = ConfigurationManager.AppSettings["UsfFacultyInfoService"];
            string url = String.Format("{0}/{1}?ticket={2}", uri, usfNetId, casTicket);
            var request = (HttpWebRequest)WebRequest.Create(url);

            request.Method = "GET";

            request.Timeout = 2 /* min */ * 60 /* sec */ * 1000 /* ms */;
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
