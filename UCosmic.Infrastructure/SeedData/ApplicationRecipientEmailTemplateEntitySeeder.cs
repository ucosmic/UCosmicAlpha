using UCosmic.Domain.Representatives;

namespace UCosmic.SeedData
{
    public class ApplicationRecipientEmailTemplateEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateApplicationRecipientEmailTemplate> _createEntity;
        private readonly IUnitOfWork _unitOfWork;

        public ApplicationRecipientEmailTemplateEntitySeeder(IProcessQueries queryProcessor,
                                                             IHandleCommands<CreateApplicationRecipientEmailTemplate>
                                                                 createEntity,
                                                             IUnitOfWork unitOfWork
            )
        {
            _queryProcessor = queryProcessor;
            _createEntity = createEntity;
            _unitOfWork = unitOfWork;
        }

        public void Seed()
        {
            
        }
    }
}
