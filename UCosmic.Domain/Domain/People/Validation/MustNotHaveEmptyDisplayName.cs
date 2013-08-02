namespace UCosmic.Domain.People
{
    public static class MustNotHaveEmptyDisplayName
    {
        public const string FailMessage = "A person's display name cannot be empty.";
        public const string FailMessageImpossibleToGeneate = "A person's display name cannot be empty unless both first and last name are provided.";
    }
}
