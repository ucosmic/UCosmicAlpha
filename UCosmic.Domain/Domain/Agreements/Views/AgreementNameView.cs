//namespace UCosmic.Domain.Agreements
//{
//    public class AgreementNameView
//    {
//        public int Id { get; set; }
//        public string Text { get; set; }
//        public string AsciiEquivalent { get; set; }
//        public bool IsFormerName { get; set; }
//        public string LanguageCode { get; set; }

//        public AgreementNameView() { }

//        public AgreementNameView(AgreementName entity)
//        {
//            Id = entity.RevisionId;
//            Text = entity.Text;
//            AsciiEquivalent = entity.AsciiEquivalent ?? "";
//            IsFormerName = entity.IsFormerName;
//            LanguageCode = entity.TranslationToLanguage != null
//                ? entity.TranslationToLanguage.TwoLetterIsoCode : "";
//        }
//    }
//}