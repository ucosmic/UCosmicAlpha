using System;

namespace UCosmic.Domain.People
{
    public class EmailAddressBy : BaseEntityQuery<EmailAddress>, IDefineQuery<EmailAddress>
    {
        internal EmailAddressBy(string value)
        {
            Value = value;
        }

        public string Value { get; private set; }
    }

    public class HandleEmailAddressByQuery : IHandleQueries<EmailAddressBy, EmailAddress>
    {
        private readonly IQueryEntities _entities;

        public HandleEmailAddressByQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmailAddress Handle(EmailAddressBy query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmailAddress>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByValue(query.Value);
        }
    }
}
