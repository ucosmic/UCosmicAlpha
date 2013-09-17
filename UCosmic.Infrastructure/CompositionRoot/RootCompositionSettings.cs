using System.Collections.Generic;
using System.Reflection;

namespace UCosmic.CompositionRoot
{
    public class RootCompositionSettings
    {
        public RootCompositionFlags Flags;
        public IEnumerable<Assembly> MvcAssemblies { get; set; }
    }
}
