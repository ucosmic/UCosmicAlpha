namespace UCosmic.Domain.Establishments
{
    public static class EstablishmentConstraints
    {
        public const int CeebCodeLength = 6;
        public const int UCosmicCodeLength = 6;
        public const int ExternalIdLength = 32;
    }

    public static class EstablishmentNameConstraints
    {
        public const int TextMaxLength = 400;
    }

    public static class EstablishmentUrlConstraints
    {
        public const int ValueMaxLength = 200;
    }

    public static class EstablishmentCustomIdConstraints
    {
        public const int ValueMaxLength = 30;
    }
}
