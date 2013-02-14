using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/person-names")]
    public class PersonNamesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public PersonNamesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("salutations")]
        public IEnumerable<TextValuePair> GetSalutations()
        {
            var values = new[]
            {
                new TextValuePair("[None]", ""),
                new TextValuePair("Dr."),
                new TextValuePair("Mr."),
                new TextValuePair("Mrs."),
                new TextValuePair("Ms."),
                new TextValuePair("Prof."),
            };
            return values;
        }

        [GET("suffixes")]
        public IEnumerable<TextValuePair> GetSuffixes()
        {
            var values = new[]
            {
                new TextValuePair("[None]", ""),
                new TextValuePair("Esq."),
                new TextValuePair("Jr."),
                new TextValuePair("PhD"),
                new TextValuePair("Sr."),
            };
            return values;
        }

        [GET("derive-display-name")]
        public string GetDeriveDisplayName([FromUri] PersonNameApiModel model)
        {
            if (model == null) throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = Mapper.Map<GenerateDisplayName>(model);
            var result = _queryProcessor.Execute(query);
            return result;
        }

    }
}
