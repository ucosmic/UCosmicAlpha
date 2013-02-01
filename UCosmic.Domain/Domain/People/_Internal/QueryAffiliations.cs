using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    internal static class QueryAffiliations
    {
        internal static Affiliation ByUserNameAndEstablishmentId(this IQueryable<Affiliation> queryable,
            string userName, int establishmentId)
        {
            return queryable.SingleOrDefault(a =>
                a.EstablishmentId == establishmentId &&
                a.Person.User != null && a.Person.User.Name.Equals(userName,
                    StringComparison.OrdinalIgnoreCase));
        }

        internal static Affiliation ByPersonIdAndEstablishmentId(this IQueryable<Affiliation> queryable, int personId, int establishmentId)
        {
            return queryable.SingleOrDefault(x => x.PersonId == personId && x.EstablishmentId == establishmentId);
        }
    }
}
