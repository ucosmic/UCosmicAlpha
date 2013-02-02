using System;

namespace UCosmic.Domain.People
{
    public class EmailConfirmationByToken : BaseEntityQuery<EmailConfirmation>, IDefineQuery<EmailConfirmation>
    {
        public EmailConfirmationByToken(Guid token)
        {
            if (token == Guid.Empty) throw new ArgumentException("Guid cannot be empty.", "token");
            Token = token;
        }

        public Guid Token { get; private set; }
    }

    public class HandleEmailConfirmationByTokenQuery : IHandleQueries<EmailConfirmationByToken, EmailConfirmation>
    {
        private readonly IQueryEntities _entities;

        public HandleEmailConfirmationByTokenQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmailConfirmation Handle(EmailConfirmationByToken query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmailConfirmation>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByToken(query.Token);
        }
    }
}
