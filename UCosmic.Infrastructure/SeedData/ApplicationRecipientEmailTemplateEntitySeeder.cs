/*
using UCosmic.Domain.Establishments;

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
            Seed(new CreateEmailTemplate
            {
                Name = EmailTemplateName.RepresentativeApplicationReceivedNotification.AsSentenceFragment(),
                SubjectFormat = "New Representative application received",
                Instructions =
@"This is a template for the email sent when a user registers as a new Representative.

There are two (2) placeholders that will be used to inject variables into the message body:
{EmailAddress} <- The email address for which ownership must be confirmed.
{EstablishmentName} <- The Establishment for which representation was requested

Type the variables between the curly braces {LikeThis} in the template below.
When a new email is generated from this template, the values will be replaced as long as they appear exactly as above.",

                BodyFormat =
@"Thank you for your application to become an official representative (agent) for {EstablishmentName}.  We will do our best to review your application in a timely fashion.  The timeframe from application to approval typically takes between 30-180 days and depending on circumstances, may take longer. We thank you for your patience as we process your application.

Thank you,

The UCosmic Team",
            });
        }

        protected void Seed(CreateEmailTemplate command)
        {
            var template = _queryProcessor.Execute(
                new EmailTemplateByName(command.Name, command.EstablishmentId));
            if (template != null) return;
            _createEntity.Handle(command);
            _unitOfWork.SaveChanges();
        }

    }
}
*/