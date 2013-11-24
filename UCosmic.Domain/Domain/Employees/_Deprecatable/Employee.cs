//using Newtonsoft.Json;
//using UCosmic.Domain.People;

//namespace UCosmic.Domain.Employees
//{
//    public class Employee : Entity
//    {
//        public int Id { get; set; }
//        public virtual Person Person { get; protected internal set; }
//        public virtual EmployeeFacultyRank FacultyRank { get; protected internal set; }
//        public string AdministrativeAppointments { get; protected internal set; }
//        public string JobTitles { get; protected internal set; }
//    }

//    internal static class EmployeeSerializer
//    {
//        internal static string ToJsonAudit(this Employee entity)
//        {
//            var state = JsonConvert.SerializeObject(new
//            {
//                entity.Id,
//                PersonId = entity.Person.RevisionId,
//                FacultyRankId = entity.FacultyRank != null ? entity.FacultyRank.Id : (int?)null,
//                entity.JobTitles,
//                entity.AdministrativeAppointments,
//            });
//            return state;
//        }
//    }
//}