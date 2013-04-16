using UCosmic.Domain.Establishments;

namespace UCosmic.SeedData
{
    public class EmailTemplateEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEmailTemplate> _createEntity;
        private readonly IUnitOfWork _unitOfWork;

        public EmailTemplateEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmailTemplate> createEntity
            , IUnitOfWork unitOfWork
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
                Name = EmailTemplateName.CreatePasswordConfirmation.AsSentenceFragment(),
                SubjectFormat = "Confirm your email address for UCosmic.com",
                Instructions =
@"This is a template for the email sent when a new user signs up for UCosmic.com. People will use this message to create a password and sign on for the first time.

There are four (4) placeholders that will be used to inject variables into the message body:
{EmailAddress} <- The email address for which ownership must be confirmed.
{ConfirmationCode} <- The code that can be entered to validate ownership.
{ConfirmationUrl} <- The URL that can be visited to validate ownership.
{SendFromUrl} <- The URL where a new confirmation can be generated after this one expires.

Type the variables between the curly braces {LikeThis} in the template below.
When a new email is generated from this template, the values will be replaced as long as they appear exactly as above.",

                BodyFormat =
@"You have requested access to UCosmic.com using the email address '{EmailAddress}'.To confirm your ownership of this email address, please do one of the following:

If UCosmic.com is still open in your browser window, go to it and enter the following Confirmation Code:
{ConfirmationCode}
^ copy the code above ^

If you have closed your browser, click the link below or copy and paste the URL into your browser:
{ConfirmationUrl}
^ click or copy the URL above ^

The code and URL above will expire in 2 hours. If you to not confirm by then, you must return to {SendFromUrl} to generate a new confirmation email.

If you did NOT request access to UCosmic.com using the above email address, please reply to this email to tell us.

Enjoy your UCosmic voyage!",
            });

            Seed(new CreateEmailTemplate
            {
                Name = EmailTemplateName.ResetPasswordConfirmation.AsSentenceFragment(),
                SubjectFormat = "Password reset instructions for UCosmic.com",
                Instructions =
@"This is a template for the email sent when a user requests a UCosmic.com password reset. People will use this message to override a forgotten password.

There are four (4) placeholders that will be used to inject variables into the message body:
{EmailAddress} <- The email address for which ownership must be confirmed.
{ConfirmationCode} <- The code that can be entered to validate ownership.
{ConfirmationUrl} <- The URL that can be visited to validate ownership.
{SendFromUrl} <- The URL where a password reset request can be generated after this one expires.

Type the variables between the curly braces {LikeThis} in the template below.
When a new email is generated from this template, the values will be replaced as long as they appear exactly as above.",

                BodyFormat =
@"You have requested to reset your UCosmic.com password using the email address '{EmailAddress}'. To confirm your ownership of this email address, please do one of the following:

If UCosmic.com is still open in your browser window, go to it and enter the following Confirmation Code:
{ConfirmationCode}
^ copy the code above ^

If you have closed your browser, click the link below or copy and paste the URL into your browser:
{ConfirmationUrl}
^ click or copy the URL above ^

The code and URL above will expire in 2 hours. If you to not confirm and reset your password by then, you must return to {SendFromUrl} to generate a new password reset request.

If you did NOT initiate a UCosmic.com password reset using the above email address, please reply to this email to tell us.

Thank you,

The UCosmic Team",
            });

            //For new Representative Application Received Notification
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
            // make sure email template does not already exist
            var template = _queryProcessor.Execute(
                new EmailTemplateByName(command.Name, command.EstablishmentId));
            if (template != null) return;
            _createEntity.Handle(command);
            _unitOfWork.SaveChanges();
        }
    }
}
