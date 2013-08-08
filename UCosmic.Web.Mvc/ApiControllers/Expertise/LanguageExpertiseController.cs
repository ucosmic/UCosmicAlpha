using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.LanguageExpertise;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/language-expertise")]
    public class LanguageExpertiseController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateLanguageExpertise> _createLanguageExpertise;
        private readonly IHandleCommands<DeleteLanguageExpertise> _deleteLanguageExpertise;
        private readonly IHandleCommands<UpdateLanguageExpertise> _updateLanguageExpertise;

        public LanguageExpertiseController(IProcessQueries queryProcessor
            , IHandleCommands<CreateLanguageExpertise> createLanguageExpertise
            , IHandleCommands<DeleteLanguageExpertise> deleteLanguageExpertise
            , IHandleCommands<UpdateLanguageExpertise> updateLanguageExpertise)
        {
            _queryProcessor = queryProcessor;
            _createLanguageExpertise = createLanguageExpertise;
            _deleteLanguageExpertise = deleteLanguageExpertise;
            _updateLanguageExpertise = updateLanguageExpertise;
        }

        [GET("")]
        public PageOfLanguageExpertiseApiModel Get([FromUri] LanguageExpertiseSearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<LanguageExpertiseSearchInputModel, LanguageExpertisesByPersonId>(input);
            var expertises = _queryProcessor.Execute(query);
            if (expertises == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfLanguageExpertiseApiModel>(expertises);
            return model;
        }

        [GET("{expertiseId:int}", ControllerPrecedence = 2)]
        public LanguageExpertiseApiModel Get(int expertiseId)
        {
            var expertise = _queryProcessor.Execute(new LanguageExpertiseById(expertiseId));
            if (expertise == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<LanguageExpertiseApiModel>(expertise);
            return model;
        }

        [CacheHttpGet(Duration = 86400)]
        [GET("proficiencies", ControllerPrecedence = 1)]
        public LanguageProficiencyApiModel GetProficiencies()
        {
            var model = new LanguageProficiencyApiModel
            {
                SpeakingMeanings = new Collection<LanguageProficiencyMeaningApiModel>(),
                ListeningMeanings = new Collection<LanguageProficiencyMeaningApiModel>(),
                ReadingMeanings = new Collection<LanguageProficiencyMeaningApiModel>(),
                WritingMeanings = new Collection<LanguageProficiencyMeaningApiModel>()
            };

            foreach (var scale in LanguageProficiency.Scales)
            {
                var meaning = LanguageProficiency.SpeakingMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                var meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(CultureInfo.InvariantCulture), scale.Description),
                    Description = meaning.Description
                };
                model.SpeakingMeanings.Add(meaningApi);

                meaning = LanguageProficiency.ListeningMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(CultureInfo.InvariantCulture), scale.Description),
                    Description = meaning.Description
                };
                model.ListeningMeanings.Add(meaningApi);

                meaning = LanguageProficiency.ReadingMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(CultureInfo.InvariantCulture), scale.Description),
                    Description = meaning.Description
                };
                model.ReadingMeanings.Add(meaningApi);

                meaning = LanguageProficiency.WritingMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(CultureInfo.InvariantCulture), scale.Description),
                    Description = meaning.Description
                };
                model.WritingMeanings.Add(meaningApi);
            }

            return model;
        }

        [POST("")]
        public HttpResponseMessage Post(LanguageExpertiseApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var createLanguageExpertiseCommand = new CreateLanguageExpertise(
                User,
                model.SpeakingProficiency,
                model.ListeningProficiency,
                model.ReadingProficiency,
                model.WritingProficiency)
            {
                LanguageId = model.LanguageId,
                Dialect = model.Dialect,
                Other = model.Other
            };

            _createLanguageExpertise.Handle(createLanguageExpertiseCommand);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Language expertise was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "LanguageExpertise",
                action = "Get",
                expertiseId = createLanguageExpertiseCommand.CreatedLanguageExpertiseId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{expertiseId:int}")]
        public HttpResponseMessage Put(int expertiseId, LanguageExpertiseApiModel model)
        {
            if (expertiseId == 0 || model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var updateLanguageExpertiseCommand = Mapper.Map<UpdateLanguageExpertise>(model);
            updateLanguageExpertiseCommand.UpdatedOn = DateTime.UtcNow;
            updateLanguageExpertiseCommand.Principal = User;
            _updateLanguageExpertise.Handle(updateLanguageExpertiseCommand);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [DELETE("{expertiseId:int}")]
        public HttpResponseMessage Delete(int expertiseId)
        {
            var deleteLanguageExpertiseCommand = new DeleteLanguageExpertise(User, expertiseId);
            _deleteLanguageExpertise.Handle(deleteLanguageExpertiseCommand);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
