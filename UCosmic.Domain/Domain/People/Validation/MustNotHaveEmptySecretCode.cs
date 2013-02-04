namespace UCosmic.Domain.People
{
    public static class MustNotHaveEmptySecretCode
    {
        public const string FailMessage = "A secret code is required to redeem an email confirmation.";
    }
}
