using System;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External.Services
{
    class UsfDepartmentIdLookup
    {
        /* Department ID Lookup Sevice */
        public static readonly string Uri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/deptIdLookup";

        private static string Get(string casTicket, string usfNetId)
        {
            string data = null;
            var request = (HttpWebRequest)WebRequest.Create(Uri);
            request.Method = "GET";

            try
            {
                request.Timeout = 15000;
                var response = request.GetResponse();
                var responseStream = new StreamReader(response.GetResponseStream());
                data = responseStream.ReadToEnd();
                responseStream.Close();
            }
            catch (Exception)
            {
                /* Elmah Log Here? */
            }

            return data;
        }
    }
}
