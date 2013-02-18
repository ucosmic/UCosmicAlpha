using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEstablishment> _createHandler;

        public EstablishmentsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishment> createHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
        }

        public PageOfEstablishmentApiModel GetAll([FromUri] EstablishmentSearchInputModel input)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);
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

        [POST("")]
        public HttpResponseMessage Post(EstablishmentPostModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new CreateEstablishment(User)
            {
                OfficialName = new CreateEstablishmentName(User),
                OfficialUrl = new CreateEstablishmentUrl(User),
                Location = new UpdateEstablishmentLocation(0, User),
            };
            Mapper.Map(model, command);

            try
            {
                _createHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.Created, "Establishment was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Establishments",
                action = "GetOne",
                establishmentId = command.CreatedEstablishmentId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);

            return response;
        }
    }
}
