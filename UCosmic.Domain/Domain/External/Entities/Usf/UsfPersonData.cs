using System;
using System.Runtime.Serialization;

namespace UCosmic.Domain.External
{
    [DataContract]
    public class UsfPersonData
    {
        [DataMember(Name = "lastUpdate")]
        internal string LastUpdate { get; set; } // MM-DD-YYYY

        [DataMember(Name = "Last Name")]
        internal string LastName { get; set; }

        [DataMember(Name = "First Name")]
        internal string FirstName { get; set; }

        [DataMember(Name = "Middle Name")]
        internal string MiddleName { get; set; }

        [DataMember(Name = "Suffix")]
        internal string Suffix { get; set; }

        [DataMember(Name = "Gender")]
        internal string Gender { get; set; }

        [DataMember(Name = "USF Email Address")]
        internal string EmailAddress { get; set; }

        [DataMember(Name = "profile")]
        internal UsfAffiliationData[] Affiliations { get; set; }
    }
}
