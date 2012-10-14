using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using UCosmic.Domain.Languages;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class LanguagesController : ApiController
    {
        private readonly IQueryEntities _queryEntities;

        public LanguagesController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [CacheHttpGet(Duration = 3600)]
        public IEnumerable<LanguageApiModel> GetAll()
        {
            var languages = _queryEntities
                .Query<Language>()
                .ToArray()
            ;
            var items = languages.Select(c => new LanguageApiModel
            {
                Name = c.GetTranslatedName().Text,
                Code = c.TwoLetterIsoCode,
            });
            return items.ToArray();
        }
    }
}
