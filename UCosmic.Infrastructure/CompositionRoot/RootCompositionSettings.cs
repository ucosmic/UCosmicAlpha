using System.Reflection;

namespace UCosmic.CompositionRoot
{
    public class RootCompositionSettings
    {
        public RootCompositionFlags Flags;
        public Assembly[] FluentValidationAssemblies { get; set; }
    }
}
