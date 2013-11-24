using System;
using System.IO;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using ImageResizer;
using UCosmic.Domain;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [LocalApiEndpoint]
    [RoutePrefix("api")]
    public class PeopleController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdatePerson> _updatePerson;
        private readonly IHandleCommands<DeletePerson> _deletePerson;
        private readonly IStoreBinaryData _binaryData;

        public PeopleController(IProcessQueries queryProcessor
            , IHandleCommands<UpdatePerson> updatePerson
            , IHandleCommands<DeletePerson> deletePerson
            , IStoreBinaryData binaryData
        )
        {
            _queryProcessor = queryProcessor;
            _updatePerson = updatePerson;
            _deletePerson = deletePerson;
            _binaryData = binaryData;
        }

        [GET("people")]
        public PageOfPersonApiModel GetPlural([FromUri] PeopleSearchInputModel model)
        {
            var query = Mapper.Map<PeopleByCriteria>(model);
            query.EagerLoad = PersonApiModelProfiler.EagerLoads;
            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<PageOfPersonApiModel>(entities);
            return models;
        }

        [GET("user/person")]
        [GET("people/{personId:int}", ActionPrecedence = 1)]
        public PersonApiModel GetSingle(int? personId = null)
        {
            var query = personId.HasValue ?
                new PersonById(personId.Value) as BaseEntityQuery<Person>
                : new MyPerson(User);
            query.EagerLoad = PersonApiModelProfiler.EagerLoads;
            var entity = _queryProcessor.Execute((IDefineQuery<Person>)query);

            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<PersonApiModel>(entity);
            return model;
        }

        [GET("people/{personId:int}/photo")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage GetPhoto(int personId, [FromUri] ImageResizeRequestModel model)
        {
            var person = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Photo,
                }
            });

            var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
            var mimeType = "image/png";
            var settings = Mapper.Map<ResizeSettings>(model);

            var content = person != null && person.Photo != null ? _binaryData.Get(person.Photo.Path) : null;
            if (content != null)
            {
                // resize the user's photo image
                mimeType = person.Photo.MimeType;
                ImageBuilder.Current.Build(new MemoryStream(content), stream, settings, true);
            }
            else
            {
                // otherwise, return the unisex photo
                var relativePath = string.Format("~/{0}", Links.images.icons.user.unisex_a_128_png);
                ImageBuilder.Current.Build(relativePath, stream, settings);
            }

            stream.Position = 0;
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream), // will dispose the stream
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            return response;
        }

        [Authorize]
        [PUT("user/person")]
        [PUT("people/{personId:int}", ActionPrecedence = 1)]
        public HttpResponseMessage Put(PersonApiModel model, int? personId = null)
        {
            var response = Request.CreateResponse();
            if (model != null)
            {
                var command = new UpdatePerson(User, personId);
                Mapper.Map(model, command);

                _updatePerson.Handle(command);
                response.StatusCode = HttpStatusCode.OK;
                var message = !personId.HasValue
                    ? "Your profile was updated successfully"
                    : "Person info was updated successfully";
                response.Content = new StringContent(message);
                return response;
            }
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        [Authorize(Roles = RoleName.EmployeeProfileManager)]
        [DELETE("{id}")]
        public HttpResponseMessage Delete(int id)
        {
            if (id == 0) throw new HttpResponseException(HttpStatusCode.BadRequest);

            var deleteCommand = new DeletePerson(User, id);
            _deletePerson.Handle(deleteCommand);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
