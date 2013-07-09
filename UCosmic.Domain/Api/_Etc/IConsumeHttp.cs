using System.Collections.Specialized;
namespace UCosmic
{
    public interface IConsumeHttp
    {
        string DownloadString(string url, int? timeout = null, int retries = 0);
        string Upload(string url, string method, NameValueCollection data, int? timeout = null, int retries = 0);
    }
}