using System.Collections.Specialized;
namespace UCosmic
{
    public interface IConsumeHttp
    {
        TReturns Download<TReturns>(string url, int? timeout = null, int retries = 0) where TReturns : class;
        TReturns Upload<TReturns>(string url, string method, NameValueCollection data, int? timeout = null, int retries = 0) where TReturns : class;
    }
}