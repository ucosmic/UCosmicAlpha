using System;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class EmployeeFacultyRankByName : BaseEntityQuery<EmployeeFacultyRank>, IDefineQuery<EmployeeFacultyRank>
    {
        public EmployeeFacultyRankByName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be empty or white space.", "name");
            Name = name;
        }

        public string Name { get; private set; }
    }

    public class HandleEmployeeFacultyRankByNameQuery : IHandleQueries<EmployeeFacultyRankByName, EmployeeFacultyRank>
    {
        private readonly IQueryEntities _entities;

        public HandleEmployeeFacultyRankByNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeFacultyRank Handle(EmployeeFacultyRankByName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmployeeFacultyRank>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => query.Name.Equals(x.Rank, StringComparison.OrdinalIgnoreCase));
        }
    }
}
