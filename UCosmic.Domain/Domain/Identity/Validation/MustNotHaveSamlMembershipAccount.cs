namespace UCosmic.Domain.Identity
{
    public static class MustNotHaveSamlMembershipAccount
    {
        public const string FailMessageFormat = "User '{0}' has a non-empty EduPersonTargetedId value.";
    }
}
