using System;

namespace UCosmic.Domain.Establishments
{
    public class EmailTemplateByName : IDefineQuery<EmailTemplate>
    {
        public EmailTemplateByName(string name, int? establishmentId = null)
        {
            if (name == null) throw new ArgumentNullException("name");
            Name = name;
            EstablishmentId = establishmentId;
        }

        public string Name { get; private set; }
        public int? EstablishmentId { get; private set; }
    }

    public class HandleEmailTemplateByNameQuery : IHandleQueries<EmailTemplateByName, EmailTemplate>
    {
        private readonly IQueryEntities _entities;

        public HandleEmailTemplateByNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmailTemplate Handle(EmailTemplateByName query)
        {
            // get the template
            var template = _entities.Query<EmailTemplate>()
                .ByName(query.Name, query.EstablishmentId)
            ;

            // fall back to default
            if (template == null && query.EstablishmentId.HasValue)
                template = _entities.Query<EmailTemplate>()
                    .ByName(query.Name, null)
                ;

            return template;
        }
    }
}
