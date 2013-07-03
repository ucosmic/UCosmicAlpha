using System;
using System.Configuration;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External.Services
{
    public class UsfDepartmentIdLookup
    {
        private Stream _stream;

        public static string CasUri
        {
            get { return ConfigurationManager.AppSettings["UsfCasLoginService"]; }
        }

        public Stream Open(string casTicket)
        {
            if (_stream != null)
            {
                return _stream;
            }

            string uri = ConfigurationManager.AppSettings["UsfDepartmentLookupService"];
            string url = String.Format("{0}?ticket={1}", uri, casTicket);
            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";

            request.Timeout = Int32.Parse(ConfigurationManager.AppSettings["UsfDepartmentIdLookupServiceTimeoutMS"]);
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
