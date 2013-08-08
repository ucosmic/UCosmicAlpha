using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [TryAuthorize]
    [RoutePrefix("api/my/profile")]
    public class MyProfileController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly IHandleCommands<UpdateMyProfile> _profileUpdateHandler;

        public MyProfileController(IProcessQueries queryProcessor
            , IQueryEntities entities
            , IHandleCommands<UpdateMyProfile> profileUpdateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _profileUpdateHandler = profileUpdateHandler;
            _entities = entities;
        }

        [GET("")]
        public MyProfileApiModel Get()
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            var person = _queryProcessor.Execute(new MyPerson(User)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations,
                    x => x.Employee,
                    x => x.Photo,
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            var model = Mapper.Map<MyProfileApiModel>(person);

            /* Does the default establishment have campuses? */
            var defaultEstablishmentId = person.DefaultAffiliation.EstablishmentId;
            var universityCampus = KnownEstablishmentType.UniversityCampus.AsSentenceFragment();
            model.DefaultEstablishmentHasCampuses = _entities.Query<Establishment>()
                .Any(x => x.Parent != null && x.Parent.RevisionId == defaultEstablishmentId &&
                    x.Type.EnglishName == universityCampus);

            return model;
        }

        [PUT("")]
        public HttpResponseMessage Put(MyProfileApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new UpdateMyProfile(User);
            Mapper.Map(model, command);

            try
            {
                _profileUpdateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Your profile was saved successfully.");
        }
    }
}
