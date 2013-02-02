using System;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class MyEmailAddressByNumber : IDefineQuery<EmailAddress>
    {
        public MyEmailAddressByNumber(IPrincipal principal, int number)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Number = number;
        }

        public IPrincipal Principal { get; private set; }
        public int Number { get; private set; }
    }

    public class HandleMyEmailAddressByNumberQuery : IHandleQueries<MyEmailAddressByNumber, EmailAddress>
    {
        private readonly IQueryEntities _entities;

        public HandleMyEmailAddressByNumberQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmailAddress Handle(MyEmailAddressByNumber query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmailAddress>()
                .ByUserNameAndNumber(query.Principal.Identity.Name, query.Number);
        }
    }
}
