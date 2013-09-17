using System;

namespace UCosmic.CompositionRoot
{
    [Flags]
    public enum RootCompositionFlags
    {
        None = 0,
        Web = 1,
        Work = 2,
        Debug = 4,
        Azure = 8,
        Verify = 16,
    }
}
