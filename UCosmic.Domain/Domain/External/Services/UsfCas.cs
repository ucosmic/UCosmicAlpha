using System;
using System.Configuration;
using System.IO;
using System.Net;

namespace UCosmic.Domain.External
{
    public static class UsfCas
    {
        private static string GetTgtResource(string username, string password)
        {
            string tgtResource = null;

            string uri = ConfigurationManager.AppSettings["UsfCasTicketService"];
            var request = (HttpWebRequest) WebRequest.Create(uri);

            request.Method = "POST";

            using (var requestStream = new StreamWriter(request.GetRequestStream()))
            {
                string requestBody = String.Format("username={0}&password={1}", username, password);
                requestStream.Write(requestBody);
                requestStream.Close();
            }

            request.Timeout = Int32.Parse(ConfigurationManager.AppSettings["UsfCASTGTTimeoutMS"]);
            var response = request.GetResponse();

            using (var responseStream = new StreamReader(response.GetResponseStream()))
            {
                var responseBody = responseStream.ReadToEnd();
                responseStream.Close();

                /*
                * <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
                * <html>
                *  <head>
                *      <title>201 The request has been fulfilled and resulted in a new resource being created</title>
                * </head>
                * <body>
                *  <h1>TGT Created</h1>
                *  <form action="https://authtest.it.usf.edu:444/v1/tickets/TGT-1152-OBHag3uftwa4gbCNffGo0o5MHpwfNI7Le9UUruzrpt30MtJfeo-IMPERS" method="POST">
                *      Service:
                *      <input type="text" name="service" value=""><br>
                *      <input type="submit" value="Submit">
                *  </form>
                * </body>
                * </html>
                */

                const string pattern = "action=";
                int startIndex = responseBody.IndexOf(pattern) + pattern.Length + 1 /* skip first quote */;
                int length = responseBody.IndexOf("\"", startIndex) - startIndex;
                tgtResource = responseBody.Substring(startIndex, length);
            }

            return tgtResource;            
        }

        private static string GetTicket(string tgtResource, string serviceUri)
        {
            string ticket = null;
            var request = (HttpWebRequest)WebRequest.Create(tgtResource);

            request.Method = "POST";
            using (var requestStream = new StreamWriter(request.GetRequestStream()))
            {
                string requestBody = String.Format("service={0}", serviceUri);
                requestStream.Write(requestBody);
                requestStream.Close();
            }

            request.Timeout = 15000;
            var response = request.GetResponse();

            using (var responseStream = new StreamReader(response.GetResponseStream()))
            {
                ticket = responseStream.ReadToEnd();
                responseStream.Close();
            }

            return ticket;
        }

        public static string GetServiceTicket(string username, string password, string serviceUri)
        {
            string tgtr = GetTgtResource(username, password);
            return GetTicket(tgtr, serviceUri);
        }
    }
}
