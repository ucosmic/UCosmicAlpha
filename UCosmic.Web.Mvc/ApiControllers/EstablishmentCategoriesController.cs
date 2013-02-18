using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class EstablishmentCategoriesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentCategoriesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("establishment-categories")]
        public IEnumerable<EstablishmentCategoryApiModel> GetCategories()
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entities = _queryProcessor.Execute(new EstablishmentCategories
            {
                EagerLoad = new Expression<Func<EstablishmentCategory, object>>[]
                {
                    x => x.Types,
                }
            });
            var models = Mapper.Map<EstablishmentCategoryApiModel[]>(entities);

            // arrange
            var modelsList = new List<EstablishmentCategoryApiModel>
            {
                models.Single(x => x.Code == EstablishmentCategoryCode.Inst),
                models.Single(x => x.Code == EstablishmentCategoryCode.Corp),
                models.Single(x => x.Code == EstablishmentCategoryCode.Govt),
            };
            foreach (var model in models.Where(x => !modelsList.Select(y => y.Code).Contains(x.Code)))
            {
                modelsList.Add(model);
            }
            foreach (var model in modelsList.Where(model => model.Types != null))
            {
                model.Types = model.Types.OrderBy(x => x.Text).ToArray();
            }

            return modelsList.ToArray();
        }
    }
}
