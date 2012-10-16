namespace UCosmic.Domain.Languages
{
    public class LanguageView
    {
        public int Id { get; private set; }
        public string TwoLetterIsoCode { get; private set; }
        public string TranslatedName { get; private set; }

        public LanguageView(Language entity)
        {
            Id = entity.Id;
            TwoLetterIsoCode = entity.TwoLetterIsoCode;
            TranslatedName = entity.GetTranslatedName().Text;
        }
    }
}
