using System;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External
{
    public static class UsfFacultyInfo
    {
        /* Faculty Information Sevice */
        private const string Uri = @"https://usfuat1.forest.usf.edu:8443/UcosmicSrvc/facultyInfo";

        private static string Get(string casTicket, string usfNetId)
        {
            string data = null;
            string url = String.Format("{0}/{1}", Uri, usfNetId);
            var request = (HttpWebRequest)WebRequest.Create(url);
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
