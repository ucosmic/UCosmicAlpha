using System;
using System.Runtime.Serialization;

namespace UCosmic.Domain.External
{
    [DataContract]
    public class UsfDepartmentsData
    {
        [DataMember(Name = "lastUpdate")]
        internal string LastUpdate { get; set; }

        [DataMember(Name = "lookup")]
        internal UsfDepartmentData[] Departments { get; set; }
    }
}