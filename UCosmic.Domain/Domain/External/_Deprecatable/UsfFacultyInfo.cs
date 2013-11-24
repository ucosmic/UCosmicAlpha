//using System;
//using System.Configuration;
//using System.IO;
//using System.Net;

//namespace UCosmic.Domain.External
//{
//    internal class UsfFacultyInfo
//    {
//        internal string Get(string casTicket, string usfNetId)
//        {
//            int atIndex = usfNetId.IndexOf('@');
//            if (atIndex != -1)
//            {
//                usfNetId = usfNetId.Substring(0, atIndex).Trim();
//            }

//            if (usfNetId.Length == 0)
//            {
//                return null;
//            }

//            string uri = ConfigurationManager.AppSettings["UsfFacultyInfoService"];
//            string url = String.Format("{0}/{1}?ticket={2}", uri, usfNetId, casTicket);

//            using (var webClient = new WebClient())
//            {
//                return webClient.DownloadString(url);
//            }
//        }


//        //private Stream _responseStream;

//        internal static string CasUri
//        {
//            get { return ConfigurationManager.AppSettings["UsfCasLoginService"]; }
//        }

//        //public Stream Open(string casTicket, string usfNetId)
//        //{
//        //    if (_responseStream != null)
//        //    {
//        //        return _responseStream;
//        //    }

//        //    int atIndex = usfNetId.IndexOf('@');
//        //    if (atIndex != -1)
//        //    {
//        //        usfNetId = usfNetId.Substring(0, atIndex).Trim();
//        //    }

//        //    if (usfNetId.Length == 0)
//        //    {
//        //        return null;
//        //    }

//        //    string uri = ConfigurationManager.AppSettings["UsfFacultyInfoService"];
//        //    string url = String.Format("{0}/{1}?ticket={2}", uri, usfNetId, casTicket);
//        //    var request = (HttpWebRequest)WebRequest.Create(url);

//        //    request.Method = "GET";

//        //    request.Timeout = Int32.Parse(ConfigurationManager.AppSettings["UsfDepartmentFacultyInfoServiceTimeoutMS"]);
//        //    var response = request.GetResponse();
//        //    _responseStream = response.GetResponseStream();

//        //    return _responseStream;
//        //}

//        //public void Close()
//        //{
//        //    if (_responseStream == null)
//        //    {
//        //        return;
//        //    }

//        //    _responseStream.Close();
//        //    _responseStream = null;
//        //}
//    }
//}
