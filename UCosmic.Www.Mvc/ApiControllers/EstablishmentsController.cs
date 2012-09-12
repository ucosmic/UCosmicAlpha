using System.Net;
using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        //[CacheHttpGet(Duration = 60)]
        public PageOf<EstablishmentApiModel> Get([FromUri] EstablishmentSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = Mapper.Map<EstablishmentsByKeyword>(input);
            var results = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOf<EstablishmentApiModel>>(results);
            return model;
        }
    }
}
