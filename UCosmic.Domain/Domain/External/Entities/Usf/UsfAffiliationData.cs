using System.Runtime.Serialization;

namespace UCosmic.Domain.External
{
    [DataContract]
    public class UsfAffiliationData
    {
        [DataMember(Name = "Faculty Rank")]
        internal int? FacultyRankId { get; set; }

        [DataMember(Name = "Position Title")]
        internal string PositionTitle { get; set; }

        [DataMember(Name = "Institutional Affiliation")]
        internal string CampusName { get; set; }

        [DataMember(Name = "College")]
        internal string CollegeName { get; set; }

        [DataMember(Name = "Department/Program")]
        internal string DepartmentName { get; set; }

        [DataMember(Name = "DEPTID")]
        internal string DepartmentId { get; set; }
    }
}