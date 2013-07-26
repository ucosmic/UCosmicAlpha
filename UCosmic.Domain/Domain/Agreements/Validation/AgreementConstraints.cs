namespace UCosmic.Domain.Agreements
{
    public static class AgreementConstraints
    {
        public const int TypeMaxLength = 150;
        public const int StatusMaxLength = 50;
    }

    public static class AgreementContactConstraints
    {
        public const int ContactTypeMaxLength = 150;
        public const int TitleMaxLength = 300;
    }

    public static class AgreementFileConstraints
    {
        public static string[] AllowedFileExtensions = new[]
        {
            "pdf", "doc", "docx", "odt", "xls", "xlsx", "ods", "ppt", "pptx",
        };
    }

    public static class AgreementContactPhoneConstraints
    {
        public const int TypeMaxLength = 150;
        public const int ValueMaxLength = 150;
    }
}
