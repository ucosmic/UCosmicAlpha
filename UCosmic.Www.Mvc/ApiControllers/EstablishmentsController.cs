using System.Net;
using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PageOf<EstablishmentApiModel> GetAll([FromUri] EstablishmentSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            //System.Threading.Thread.Sleep(2000);
            var query = Mapper.Map<EstablishmentsByKeyword>(input);
            var results = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOf<EstablishmentApiModel>>(results);
            return model;
        }
    }
}
