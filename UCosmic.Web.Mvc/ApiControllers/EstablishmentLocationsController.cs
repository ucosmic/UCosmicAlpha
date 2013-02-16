using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/establishments")]
    public class EstablishmentLocationsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentLocationsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{establishmentId}/location")]
        public EstablishmentLocationApiModel Get(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000);
            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Location.Places.Select(y => y.Ancestors),
                }
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EstablishmentLocationApiModel>(entity.Location);
            return model;
        }

        [PUT("{establishmentId}/location")]
        [Authorize(Roles = RoleName.EstablishmentAdministrator)]
        public HttpResponseMessage Put(int establishmentId, EstablishmentLocationPutModel model)
        {
            //return null; // cause fail callback on client
            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment location was successfully updated.");
            return response;
        }
    }
}
