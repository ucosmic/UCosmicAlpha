namespace UCosmic.Domain.Identity
{
    public static class MustHaveMinimumPasswordLength
    {
        public const string FailMessageFormat = "Password must be at least {0} characters long.";

        public static string FormatFailMessage(int minimumPasswordLength)
        {
            return string.Format(FailMessageFormat, minimumPasswordLength);
        }
    }
}
