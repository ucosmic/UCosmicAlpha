using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace UCosmic.Www.Mvc
{
    public class RequireHttpsMessageHandler : DelegatingHandler
    {
        private readonly int _sslPort;

        public RequireHttpsMessageHandler(int sslPort = 443)
        {
            _sslPort = sslPort;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // based on the WebApiContrib RequireHttpsHandler and Carlos Figueria's blog:
            // http://stackoverflow.com/questions/11265710/require-ssl-in-webapi
            // http://blogs.msdn.com/b/carlosfigueira/archive/2012/03/09/implementing-requirehttps-with-asp-net-web-api.aspx
            // https://github.com/WebApiContrib/WebAPIContrib/blob/master/src/WebApiContrib/MessageHandlers/RequireHttpsHandler.cs
            if (request.RequestUri.Scheme != Uri.UriSchemeHttps)
            {
                // for GET and HEAD requests, 302 redirect to the HTTPS endpoint.
                if (request.Method.Equals(HttpMethod.Get) || request.Method.Equals(HttpMethod.Head))
                {
                    return Task<HttpResponseMessage>.Factory.StartNew(() =>
                    {
                        var uriBuilder = new UriBuilder(request.RequestUri)
                        {
                            Scheme = Uri.UriSchemeHttps,
                            Port = _sslPort
                        };

                        var response = request.CreateResponse(HttpStatusCode.Found);
                        response.Headers.Location = uriBuilder.Uri;

                        if (request.Method.Equals(HttpMethod.Get))
                            response.Content = new StringContent(string.Format(
                                "<p>The resource can be found at <a href=\"{0}\">{0}</a>.</p>",
                                    uriBuilder.Uri.AbsoluteUri));

                        return response;
                    });
                }

                // for non-GET/HEAD requests, prevent client from issuing a GET for redirect.
                // instead, clients must explicitly change the request protocol to https.
                return Task<HttpResponseMessage>.Factory.StartNew(() => new HttpResponseMessage(HttpStatusCode.Forbidden)
                {
                    Content = new StringContent("The HTTPS protocol is required for this URI request."),
                });
            }

            // allow HTTPS requests to pass through the message handler.
            return base.SendAsync(request, cancellationToken);
        }
    }
}