namespace UCosmic.Domain.Establishments
{
    public class EstablishmentNameView
    {
        public string Text { get; set; }
        public string AsciiEquivalent { get; set; }
        public string LanguageCode { get; set; }

        public EstablishmentNameView() { }

        public EstablishmentNameView(EstablishmentName entity)
        {
            Text = entity.Text;
            AsciiEquivalent = entity.AsciiEquivalent ?? "";
            LanguageCode = entity.TranslationToLanguage != null
                ? entity.TranslationToLanguage.TwoLetterIsoCode : "";
        }
    }
}