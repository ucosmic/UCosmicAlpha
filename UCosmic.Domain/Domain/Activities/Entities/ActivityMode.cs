namespace UCosmic.Domain.Activities
{
    public enum ActivityMode
    {
        Draft = 1,
        Public = 2,
        Protected = 3,

        EditMode = 10,
        EditDraft = EditMode + Draft,
        EditPublic = EditMode + Public,
        EditProtected = EditMode + Protected
    }
}