using System.Collections.ObjectModel;
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
                    Scale = new Collection<LanguageProficiency.ScaleEntry>(LanguageProficiency.Scale),
                    SpeakingMeanings = new Collection<LanguageProficiency.Meaning>(LanguageProficiency.Speaking),
                    ListeningMeanings = new Collection<LanguageProficiency.Meaning>(LanguageProficiency.Listening),
                    ReadingMeanings = new Collection<LanguageProficiency.Meaning>(LanguageProficiency.Reading),
                    WritingMeanings = new Collection<LanguageProficiency.Meaning>(LanguageProficiency.Writing)
                };

            return model;
        }
    }
}
