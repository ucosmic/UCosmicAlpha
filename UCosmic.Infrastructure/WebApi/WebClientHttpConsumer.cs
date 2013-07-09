using System;
using System.Collections.Specialized;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace UCosmic.WebApi
{
    public class WebClientHttpConsumer : IConsumeHttp
    {
        public string DownloadString(string url, int? timeout = null, int retries = 0)
        {
            var uri = new Uri(url);
            var thisTry = 1;
            var tryLimit = retries + 1;

            var taskCompletionSource = new TaskCompletionSource<string>();
            Task.Factory.StartNew(() =>
            {
                using (var httpClient = new HttpClient())
                {
                    if (timeout.HasValue) httpClient.Timeout = timeout.Value;

                    httpClient.DownloadStringCompleted += (sender, e) =>
                    {
                        if (e.Error != null)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).DownloadStringAsync(uri);
                            else
                                taskCompletionSource.SetException(e.Error);
                        }
                        else if (e.Cancelled)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).DownloadStringAsync(uri);
                            else
                                taskCompletionSource.SetCanceled();
                        }
                        else
                        {
                            taskCompletionSource.SetResult(e.Result);
                        }
                    };

                    httpClient.DownloadStringAsync(uri);
                }
            });

            return taskCompletionSource.Task.Result;
        }

        public string Upload(string url, string method, NameValueCollection data, int? timeout = null, int retries = 0)
        {
            var uri = new Uri(url);
            var thisTry = 1;
            var tryLimit = retries + 1;

            var taskCompletionSource = new TaskCompletionSource<string>();
            Task.Factory.StartNew(() =>
            {
                using (var httpClient = new HttpClient())
                {
                    if (timeout.HasValue) httpClient.Timeout = timeout.Value;

                    httpClient.UploadValuesCompleted += (sender, e) =>
                    {
                        if (e.Error != null)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).UploadValuesAsync(uri, method, data);
                            else
                                taskCompletionSource.SetException(e.Error);
                        }
                        else if (e.Cancelled)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).UploadValuesAsync(uri, method, data);
                            else
                                taskCompletionSource.SetCanceled();
                        }
                        else
                        {
                            var responseText = Encoding.UTF8.GetString(e.Result);
                            taskCompletionSource.SetResult(responseText);
                        }
                    };

                    httpClient.UploadValuesAsync(uri, method, data);
                }
            });

            return taskCompletionSource.Task.Result;
        }

        //public string Get(string url)
        //{
        //    string content = null;
        //    var request = WebRequest.Create(url);
        //    var response = request.GetResponse();
        //    var stream = response.GetResponseStream();
        //    if (stream != null)
        //    {
        //        var reader = new StreamReader(stream);
        //        content = reader.ReadToEnd();
        //        reader.Close();
        //        stream.Close();
        //    }
        //    response.Close();
        //    return content;
        //}
    }

    public class HttpClient : WebClient
    {
        public int? Timeout { get; set; }

        protected override WebRequest GetWebRequest(Uri address)
        {
            var request = base.GetWebRequest(address);
            if (request != null && Timeout.HasValue) request.Timeout = Timeout.Value;
            return request;
        }
    }
}
