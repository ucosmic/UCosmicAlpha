using System;
using System.Collections.Specialized;
using System.Text;
using System.Threading.Tasks;

namespace UCosmic.WebApi
{
    public class WebClientHttpConsumer : IConsumeHttp
    {
        public TReturns Download<TReturns>(string url, int? timeout = null, int retries = 0) where TReturns : class
        {
            using (var webClient = new HttpClient())
            {
                if (timeout.HasValue) webClient.Timeout = timeout.Value;
                var thisTry = 1;
                do
                {
                    try
                    {
                        if (typeof(TReturns) == typeof(string))
                            return webClient.DownloadString(url) as TReturns;

                        if (typeof(TReturns) == typeof(byte[]))
                            return webClient.DownloadData(url) as TReturns;

                        throw NewReturnValueNotSupportedException<TReturns>();
                    }
                    catch (Exception)
                    {
                        if (thisTry > retries) throw;
                    }
                } while (thisTry++ <= retries);
            }

            throw UnicornException;
        }

        public TReturns Upload<TReturns>(string url, string method, NameValueCollection data, int? timeout = null, int retries = 0) where TReturns : class
        {
            using (var webClient = new HttpClient())
            {
                if (timeout.HasValue) webClient.Timeout = timeout.Value;
                var thisTry = 1;
                do
                {
                    try
                    {
                        if (typeof(TReturns) == typeof(string))
                            return Encoding.UTF8.GetString(webClient.UploadValues(url, method, data)) as TReturns;

                        if (typeof(TReturns) == typeof(byte[]))
                            return webClient.UploadValues(url, method, data) as TReturns;

                        throw NewReturnValueNotSupportedException<TReturns>();
                    }
                    catch (Exception)
                    {
                        if (thisTry > retries) throw;
                    }
                } while (thisTry++ <= retries);
            }

            throw new ApplicationException("This line of code should never have been reached, so this method needs to be debugged.");
        }

        public TReturns DownloadAsync<TReturns>(string url, int? timeout = null, int retries = 0) where TReturns : class
        {
            var uri = new Uri(url);
            var thisTry = 1;
            var tryLimit = retries + 1;

            var taskCompletionSource = new TaskCompletionSource<TReturns>();
            Task.Factory.StartNew(() =>
            {
                using (var httpClient = new HttpClient())
                {
                    if (timeout.HasValue) httpClient.Timeout = timeout.Value;

                    httpClient.DownloadDataCompleted += (sender, e) =>
                    {
                        if (e.Error != null)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).DownloadDataAsync(uri);
                            else
                                taskCompletionSource.SetException(e.Error);
                        }
                        else if (e.Cancelled)
                        {
                            if (thisTry++ < tryLimit)
                                ((HttpClient)sender).DownloadDataAsync(uri);
                            else
                                taskCompletionSource.SetCanceled();
                        }
                        else
                        {
                            if (typeof(TReturns) == typeof(string))
                                taskCompletionSource.SetResult(Encoding.UTF8.GetString(e.Result) as TReturns);

                            else if (typeof(TReturns) == typeof(byte[]))
                                taskCompletionSource.SetResult(e.Result as TReturns);

                            else
                                taskCompletionSource.SetException(NewReturnValueNotSupportedException<TReturns>());
                        }
                    };

                    httpClient.DownloadDataAsync(uri);
                }
            });

            return taskCompletionSource.Task.Result;
        }

        public TReturns UploadAsync<TReturns>(string url, string method, NameValueCollection data, int? timeout = null, int retries = 0) where TReturns : class
        {
            var uri = new Uri(url);
            var thisTry = 1;
            var tryLimit = retries + 1;

            var taskCompletionSource = new TaskCompletionSource<TReturns>();
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
                            if (typeof(TReturns) == typeof(string))
                                taskCompletionSource.SetResult(Encoding.UTF8.GetString(e.Result) as TReturns);

                            else if (typeof(TReturns) == typeof(byte[]))
                                taskCompletionSource.SetResult(e.Result as TReturns);

                            else
                                taskCompletionSource.SetException(NewReturnValueNotSupportedException<TReturns>());
                        }
                    };

                    httpClient.UploadValuesAsync(uri, method, data);
                }
            });

            return taskCompletionSource.Task.Result;
        }

        private static readonly ApplicationException UnicornException = new ApplicationException(
            "This line of code should never have been reached, so this method needs to be debugged.");

        private static NotSupportedException NewReturnValueNotSupportedException<TReturns>() where TReturns : class
        {
            return new NotSupportedException(string.Format(
                "The return type '{0}' is currently not supported. Only byte[] and string are valid return types for this method.",
                    typeof(TReturns).Name));
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
}
