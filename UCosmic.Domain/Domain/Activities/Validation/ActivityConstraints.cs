using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class ActivityConstraints
    {
        public const int TypeMaxLength = 128;
    }

    public class ActivityValuesConstraints
    {
        public const int TitleMaxLength = 500;
    }

    public class ActivityDocumentConstraints
    {
        public const int ModeTextMaxLength = 20;
        public const int MaxTitleLength = 64;
        public const int MaxFileMegaBytes = 4;
        public const int MaxFileBytes = MaxFileMegaBytes * 1024 * 1024;
        public const FileSizeUnitName MaxFileUnitName = FileSizeUnitName.Megabyte;
        public const FileSizeUnitAbbreviation MaxFileUnitAbbreviation = FileSizeUnitAbbreviation.Mb;
    }
}
