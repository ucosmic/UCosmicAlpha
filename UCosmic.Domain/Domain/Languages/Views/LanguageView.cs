namespace UCosmic.Domain.Languages
{
    public class LanguageView
    {
        public int Id { get; set; }
        public string TwoLetterIsoCode { get; set; }
        public string TranslatedName { get; set; }

        public LanguageView() { }

        public LanguageView(Language entity)
        {
            Id = entity.Id;
            TwoLetterIsoCode = entity.TwoLetterIsoCode;
            TranslatedName = entity.GetTranslatedName().Text;
        }
    }
}
