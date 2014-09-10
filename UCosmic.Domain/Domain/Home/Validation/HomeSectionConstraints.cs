namespace UCosmic.Domain.Home
{
    public static class HomeSectionConstraints
    {

        public const int TitleMaxLength = 100;
        public const int DescriptionMaxLength = 50;
        public static readonly string[] AllowedPhotoFileExtensions = new[]
        {
            "png", "jpg", "jpeg", "gif",
        };
    }

}
