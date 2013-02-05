using System.Collections.Generic;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class PersonNamesController : ApiController
    {
        [GET("person-name-salutations")]
        public IEnumerable<TextValuePair> GetSalutations()
        {
            var values = new[]
            {
                new TextValuePair("[None]", ""),
                new TextValuePair("Dr."),
                new TextValuePair("Mr."),
                new TextValuePair("Mrs."),
                new TextValuePair("Ms."),
                new TextValuePair("Prof."),
            };
            return values;
        }

        [GET("person-name-suffixes")]
        public IEnumerable<TextValuePair> GetSuffixes()
        {
            var values = new[]
            {
                new TextValuePair("[None]", ""),
                new TextValuePair("Esq."),
                new TextValuePair("Jr."),
                new TextValuePair("PhD"),
                new TextValuePair("Sr."),
            };
            return values;
        }

    }
}
