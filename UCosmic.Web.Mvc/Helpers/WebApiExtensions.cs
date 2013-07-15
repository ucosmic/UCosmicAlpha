using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace UCosmic.Web.Mvc
{
    public static class WebApiExtensions
    {
        public static HttpContextBase GetHttpContext(this HttpRequestMessage request)
        {
            if (request != null)
            {
                // look in properties
                const string keyName = "MS_HttpContext";
                if (request.Properties.ContainsKey(keyName))
                {
                    return request.Properties[keyName] as HttpContextBase;
                }
            }
            return null;
        }

        public static bool GetIsLocal(this HttpRequestMessage request)
        {
            if (request != null)
            {
                // look in properties
                const string keyName = "MS_IsLocal";
                if (request.Properties.ContainsKey(keyName))
                {
                    var isLocal = request.Properties[keyName] as Lazy<bool>;
                    if (isLocal != null) return isLocal.Value;
                }
            }
            throw new NotSupportedException("Could not get IsLocal from WebAPI HTTP Request Properties.");
        }

        private static readonly Dictionary<string, string> MimeMaps = new Dictionary<string, string>
        {
            { "pdf",    "application/pdf" },
            { "doc",    "application/msword" },
            { "xls",    "application/vnd.ms-excel" },
            { "ppt",    "application/vnd.ms-powerpoint" },
            { "docx",   "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { "xlsx",   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { "pptx",   "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
            { "odt",    "application/vnd.oasis.opendocument.text" },
            { "ods",    "application/vnd.oasis.opendocument.spreadsheet" },
            { "txt",    "text/plain" },
        };

        public static string GetContentType(this string fileName)
        {
            const string octetStream = "application/octet-stream";
            if (string.IsNullOrWhiteSpace(fileName)) return octetStream;

            var indexOfDot = fileName.LastIndexOf('.');
            if (indexOfDot < 1) return octetStream;
            var extension = Path.GetExtension(fileName);

            return MimeMaps.Any(x => x.Key.Equals(extension, StringComparison.OrdinalIgnoreCase))
                ? MimeMaps.Single(x => x.Key.Equals(extension, StringComparison.OrdinalIgnoreCase)).Value
                : octetStream;
        }
    }
}