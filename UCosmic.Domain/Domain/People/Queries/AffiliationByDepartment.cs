using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class AffiliationByDepartment : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        // do not pass entities to command objects, use scalars
        public int PersonId { get; private set; }
        public int EstablishmentId { get; private set; }
        public int? CampusId { get; private set; }
        public int? CollegeId { get; private set; }
        public int? DepartmentId { get; private set; }

        public AffiliationByDepartment( int personId,
                                        int establishmentId,
                                        int? campusId,
                                        int? collegeId,
                                        int? departmentId )
        {
            PersonId = personId;
            EstablishmentId = establishmentId;
            CampusId = campusId;
            CollegeId = collegeId;
            DepartmentId = departmentId;
        }
    }

    public class HandleAffiliationByDepartmentQuery : IHandleQueries<AffiliationByDepartment, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationByDepartmentQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation Handle(AffiliationByDepartment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var affiliation = _entities.Query<Affiliation>()
                .SingleOrDefault( a => (a.PersonId == query.PersonId) &&
                                       (a.EstablishmentId == query.EstablishmentId) &&
                                       ((query.CampusId.HasValue) ?  a.CampusId == query.CampusId : a.CampusId == null) &&
                                       ((query.CollegeId.HasValue) ? a.CollegeId == query.CollegeId : a.CollegeId == null) &&
                                       ((query.DepartmentId.HasValue) ? a.DepartmentId == query.DepartmentId : a.DepartmentId == null));

            return affiliation;
        }
    }
}
