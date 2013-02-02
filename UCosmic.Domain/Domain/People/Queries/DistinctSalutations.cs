using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class DistinctSalutations : IDefineQuery<string[]>
    {
        public string[] Exclude { get; set; }
    }

    public class HandleDistinctSalutationsQuery : IHandleQueries<DistinctSalutations, string[]>
    {
        private readonly IQueryEntities _entities;

        public HandleDistinctSalutationsQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public string[] Handle(DistinctSalutations query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Person>()
                .WithNonEmptySalutation()
                .SelectSalutations()
                .Distinct()
            ;

            if (query.Exclude != null && query.Exclude.Length > 0)
                results = results.Where(s => !query.Exclude.Contains(s));

            return results.ToArray();
        }
    }
}
