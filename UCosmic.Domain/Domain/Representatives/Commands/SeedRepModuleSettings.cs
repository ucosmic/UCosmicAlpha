using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Representatives.Commands
{
    public class SeedRepModuleSettings
    {
        public string WelcomeMessage { get; set; }


        public class HandleSeedRepModuleSettingsCommand : IHandleCommands<SeedRepModuleSettings>
        {
            public void Handle(SeedRepModuleSettings command)
            {
                
            }
        }

    }
}
