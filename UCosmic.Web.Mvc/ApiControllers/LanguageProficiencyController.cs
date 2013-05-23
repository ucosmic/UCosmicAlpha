using System.Collections.ObjectModel;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.LanguageExpertises;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/language-proficiency")]
    public class LanguageProficiencyController : ApiController
    {
        [GET("")]
        public LanguageProficiencyApiModel Get()
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
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(), scale.Description),
                    Description = meaning.Description
                };
                model.SpeakingMeanings.Add(meaningApi);

                meaning = LanguageProficiency.ListeningMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(), scale.Description),
                    Description = meaning.Description
                };
                model.ListeningMeanings.Add(meaningApi);

                meaning = LanguageProficiency.ReadingMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(), scale.Description),
                    Description = meaning.Description
                };
                model.ReadingMeanings.Add(meaningApi);

                meaning = LanguageProficiency.WritingMeanings.SingleOrDefault(m => m.Proficiency == scale.Proficiency);
                meaningApi = new LanguageProficiencyMeaningApiModel
                {
                    Weight = scale.Weight,
                    Title = string.Format("{0}. {1}", scale.Weight.ToString(), scale.Description),
                    Description = meaning.Description
                };
                model.WritingMeanings.Add(meaningApi);
            }

            return model;
        }
    }
}
