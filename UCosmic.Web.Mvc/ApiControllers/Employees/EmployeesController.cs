using System.Web.Http;
using AttributeRouting;
using FluentValidation;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.ApiControllers
{
    //[DefaultApiHttpRouteConvention]
    [RoutePrefix("api")]
    public class EmployeesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateEmployee> _createValidator;

        public EmployeesController(IProcessQueries queryProcessor
            , IValidator<CreateEmployee> createValidator
        )
        {
            _queryProcessor = queryProcessor;
            _createValidator = createValidator;
        }

#if false
        [GET("agreements/{agreementId:int}")]
        public EmployeeApiModel GetOne(int agreementId)
        {
            var entity = _queryProcessor.Execute(new EmployeeById(User, agreementId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EmployeeApiModel>(entity);
            return model;
        }


        [GET("agreements/{domain}")]
        public IEnumerable<EmployeeApiModel> Get(string domain)
        {
            // use domain parameter, but fall back to style cookie if not passed.
            var tenancy = Request.Tenancy() ?? new Tenancy { StyleDomain = "default" };
            domain = string.IsNullOrWhiteSpace(domain)
                ? tenancy.StyleDomain : domain;

            if ("default".Equals(domain) || string.IsNullOrWhiteSpace(domain))
            {
                // fall back again to user default affiliation
                var defaultAffliation = _queryProcessor.Execute(new MyDefaultAffiliation(User));
                if (defaultAffliation != null)
                    domain = defaultAffliation.WebsiteUrl;
            }

            var entities = _queryProcessor.Execute(new EmployeesByOwnerDomain(User, domain));
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<EmployeeApiModel[]>(entities);
            return models;
        }

        [POST("agreements")]
        public HttpResponseMessage Post(EmployeeApiModel model)
        {
            //var entity = _queryProcessor.Execute(new EmployeeById(User, agreementId));
            //if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            //var model = Mapper.Map<EmployeeApiModel>(entity);
            //return model;
            return null;
        }

        [POST("agreements/validate")]
        public HttpResponseMessage Validate(EmployeeApiModel model)
        {
            var command = new CreateEmployee(User);
            Mapper.Map(model, command);
            var validationResult = _createValidator.Validate(command);

            if (!validationResult.IsValid)
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    Mapper.Map<ValidationResultApiModel>(validationResult));

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [GET("agreements/{domain}/partners")]
        public IEnumerable<EmployeeParticipantApiModel> GetPartners(string domain)
        {
            var query = new PartnerParticipantsByOwnerDomain(User, domain)
            {
                EagerLoad = new Expression<Func<EmployeeParticipant, object>>[]
                {
                    x => x.Establishment.Location,
                    x => x.Establishment.Names.Select(y => y.TranslationToLanguage),
                }
            };
            var partners = _queryProcessor.Execute(query);

            // convert to model
            var models = Mapper.Map<EmployeeParticipantApiModel[]>(partners);

            return models;
        }

        [GET("agreements/{domain}/partners/places/{placeType?}")]
        public IEnumerable<EmployeePlaceApiModel> GetPartnerPlaces(string domain, string placeType = null)
        {
            var query = new PartnerPlacesByOwnerDomain(User, domain)
            {
                EagerLoad = new Expression<Func<Place, object>>[]
                {
                    x => x.GeoPlanetPlace.Type,
                    //x => x.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace.Type),
                },
                OrderBy = new Dictionary<Expression<Func<Place, object>>, OrderByDirection>
                {
                    { x => x.OfficialName, OrderByDirection.Ascending },
                },
            };
            if ("countries".Equals(placeType, StringComparison.OrdinalIgnoreCase))
                query.GroupBy = PlaceGroup.Countries;
            if ("continents".Equals(placeType, StringComparison.OrdinalIgnoreCase))
                query.GroupBy = PlaceGroup.Continents;
            var places = _queryProcessor.Execute(query);

            // convert to model
            var models = Mapper.Map<EmployeePlaceApiModel[]>(places);

            return models;
        }

        [GET("agreements/{agreementId:int}/participants")]
        public IEnumerable<EmployeeParticipantApiModel> GetParticipants(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ParticipantsByEmployeeId(User, agreementId)
            {
                EagerLoad = new Expression<Func<EmployeeParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
                OrderBy = new Dictionary<Expression<Func<EmployeeParticipant, object>>, OrderByDirection>
                {
                    { x => x.IsOwner, OrderByDirection.Descending },
                },
            });
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<EmployeeParticipantApiModel[]>(entities);
            return models;
        }

        [GET("agreements/{agreementId:int}/participant/{establishmentId}")]
        public EmployeeParticipantApiModel GetParticipant(int agreementId, int establishmentId)
        {
            var entity = _queryProcessor.Execute(new ParticipantByEstablishmentId(User, establishmentId, agreementId)
            {
                EagerLoad = new Expression<Func<EmployeeParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EmployeeParticipantApiModel>(entity);
            return model;
        }
#endif
    }
}
