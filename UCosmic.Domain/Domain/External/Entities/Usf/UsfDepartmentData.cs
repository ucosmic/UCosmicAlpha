using System.Runtime.Serialization;

namespace UCosmic.Domain.External
{
    [DataContract]
    public class UsfDepartmentData
    {
        [DataMember(Name = "DEPTID")]
        internal string DepartmentId { get; set; }

        [DataMember(Name = "INSTITUTION")]
        internal string CampusName { get; set; }

        [DataMember(Name = "COLLEGE")]
        internal string CollegeName { get; set; }

        [DataMember(Name = "DEPARTMENT")]
        internal string DepartmentName { get; set; }
    }
}