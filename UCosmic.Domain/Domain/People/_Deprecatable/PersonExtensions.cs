//using System.Linq;

//namespace UCosmic.Domain.People
//{
//    public static class PersonExtensions
//    {
//        public static string GetDepartment(this Person person)
//        {
//            string name = person.DefaultAffiliation.Establishment.OfficialName;;

//            if (person.Affiliations.Any(a => a.Department != null))
//            {
//                name = person.Affiliations.First(a => a.Department != null).Department.OfficialName;
//            }
//            else if (person.Affiliations.Any(a => a.College != null))
//            {
//                name = person.Affiliations.First(a => a.College != null).College.OfficialName;
//            }
//            else if (person.Affiliations.Any(a => a.Campus != null))
//            {
//                name = person.Affiliations.First(a => a.Campus != null).Campus.OfficialName;
//            }

//            return name;
//        }
//    }
//}
