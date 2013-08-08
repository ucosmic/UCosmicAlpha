using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Languages;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/languages")]
    public class LanguagesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public LanguagesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("")]
        [CacheHttpGet(Duration = 3600)]
        public IEnumerable<LanguageApiModel> Get()
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var views = _queryProcessor.Execute(new LanguagesUnfiltered
            {
                UserLanguageFirst = true,
                OrderBy = new Dictionary<Expression<Func<LanguageView, object>>, OrderByDirection>
                {
                    { x => x.TranslatedName, OrderByDirection.Ascending },
                },
            });
            var items = Mapper.Map<LanguageApiModel[]>(views);
            return items;
        }
    }
}
