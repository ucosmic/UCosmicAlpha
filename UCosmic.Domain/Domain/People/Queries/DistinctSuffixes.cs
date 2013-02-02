using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class DistinctSuffixes : IDefineQuery<string[]>
    {
        public string[] Exclude { get; set; }
    }

    public class HandleDistinctSuffixesQuery : IHandleQueries<DistinctSuffixes, string[]>
    {
        private readonly IQueryEntities _entities;

        public HandleDistinctSuffixesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public string[] Handle(DistinctSuffixes query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Person>()
                .WithNonEmptySuffix()
                .SelectSuffixes()
                .Distinct()
            ;

            if (query.Exclude != null && query.Exclude.Length > 0)
                results = results.Where(s => !query.Exclude.Contains(s));

            return results.ToArray();
        }
    }
}
