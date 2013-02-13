using System.Net;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PageOfEstablishmentApiModel GetAll([FromUri] EstablishmentSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            //System.Threading.Thread.Sleep(2000);
            var query = Mapper.Map<EstablishmentViewsByKeyword>(input);
            var views = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfEstablishmentApiModel>(views);
            return model;
        }

        [GET("{establishmentId}")]
        public EstablishmentApiModel GetOne(int establishmentId)
        {
            var view = _queryProcessor.Execute(new EstablishmentViewById(establishmentId));
            if (view == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EstablishmentApiModel>(view);
            return model;
        }
    }
}
