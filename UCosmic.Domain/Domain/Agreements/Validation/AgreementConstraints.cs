namespace UCosmic.Domain.Agreements
{
    public static class AgreementConstraints
    {
        public const int TitleMaxLength = 500;
        public const int NameMaxLength = 500;
        public const int TypeMaxLength = 150;
        public const int StatusMaxLength = 50;
    }

    public static class AgreementFileConstraints
    {
        public const int FileNameMaxLength = 210;
        public const int NameMaxLength = 200;
        public static readonly string[] AllowedFileExtensions = new[]
        {
            "pdf", "doc", "docx", "odt", "xls", "xlsx", "ods", "ppt", "pptx",
        };
    }

    public static class AgreementContactConstraints
    {
        public const int TypeMaxLength = 150;
        public const int TitleMaxLength = 300;
    }

    public static class AgreementContactPhoneConstraints
    {
        public const int TypeMaxLength = 150;
        public const int ValueMaxLength = 150;
    }
}
