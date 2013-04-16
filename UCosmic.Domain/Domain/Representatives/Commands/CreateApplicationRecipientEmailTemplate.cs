using System;

namespace UCosmic.Domain.Representatives
{
    public class CreateApplicationRecipientEmailTemplate
    {
        public string RecipientAddress { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
    }

    public class HandleApplicationRecipientEmailTemplateCommand : IHandleCommands<CreateApplicationRecipientEmailTemplate>
    {
        private readonly ICommandEntities _entities;

        public HandleApplicationRecipientEmailTemplateCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateApplicationRecipientEmailTemplate command)
        {
            if(command == null) throw new ArgumentNullException("command");

            var entity = new EmailTemplate
            {
                RecipientAddress = command.RecipientAddress,
                EmailSubject = command.EmailSubject,
                EmailBody = command.EmailBody
            };

            _entities.Create(entity);
        }
    }
}
