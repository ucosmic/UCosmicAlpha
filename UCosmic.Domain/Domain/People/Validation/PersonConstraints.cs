namespace UCosmic.Domain.People
{
    public static class PersonConstraints
    {
        public const int DisplayNameMaxLength = 400;
        public const int SalutationMaxLength = 50;
        public const int FirstNameMaxLength = 100;
        public const int MiddleNameMaxLength = 100;
        public const int LastNameMaxLength = 100;
        public const int SuffixMaxLength = 50;
        public static readonly string[] AllowedPhotoFileExtensions = new[]
        {
            "png", "jpg", "jpeg", "gif",
        };
    }

    public static class EmailAddressConstraints
    {
        public const int ValueMaxLength = 256;
    }

    public static class AffiliationConstraints
    {
        public const int JobTitlesMaxLength = 500;
    }
}
