using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace UCosmic.Web.Mvc
{
    public static class HtmlHelperExtensions
    {
        public static string SerializeObject(this HtmlHelper helper, object model)
        {
            var jsonSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            return JsonConvert.SerializeObject(model, jsonSettings).Replace(@"\", @"\\").Replace("'", @"\'");
        }
    }
}