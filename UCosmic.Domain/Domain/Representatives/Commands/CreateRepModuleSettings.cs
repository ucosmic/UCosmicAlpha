
namespace UCosmic.Domain.Representatives
{
    public class CreateRepModuleSettings
    {
        public string WelcomeMessage { get; set; }


        public class HandleSeedRepModuleSettingsCommand : IHandleCommands<CreateRepModuleSettings>
        {
            public void Handle(CreateRepModuleSettings command)
            {

            }
        }

    }
}
