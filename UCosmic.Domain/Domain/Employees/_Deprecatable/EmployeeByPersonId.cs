//using System;
//using System.Linq;

//namespace UCosmic.Domain.Employees
//{
//    public class EmployeeByPersonId : BaseEntityQuery<Employee>, IDefineQuery<Employee>
//    {
//        public int PersonId { get; set; }

//        public EmployeeByPersonId(int personId)
//        {
//            if (personId == 0) throw new ArgumentNullException("personId");

//            PersonId = personId;
//        }
//    }

//    public class HandleEmployeeByPersonIdQuery : IHandleQueries<EmployeeByPersonId, Employee>
//    {
//        private readonly IQueryEntities _entities;

//        public HandleEmployeeByPersonIdQuery(IQueryEntities entities)
//        {
//            _entities = entities;
//        }

//        public Employee Handle(EmployeeByPersonId query)
//        {
//            if (query == null) throw new ArgumentNullException("query");

//            return _entities.Query<Employee>()
//                .EagerLoad(_entities, query.EagerLoad)
//                .SingleOrDefault(p => p.Person.RevisionId == query.PersonId);
//        }
//    }
//}
