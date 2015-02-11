using System;

namespace UCosmic.Web.Mvc.Models
{
    // this class matches the columns used in the excel import, all other columns can be ignored.
    public class StudentImportApi
    {
        public int externalId { get; set; }
        public string status { get; set; }//in/out
        public string level {get; set;}//must match the level in the level table
        //rank//not needed as manually added - later have form for members to update
        public string termDescription {get; set;}
        public DateTime termEnd {get; set;}
        public DateTime termStart {get; set;}
        public string countryCode {get; set;}
        public string progCode {get; set;}
        public string progDescription {get; set;}
        public string ucsomicOfficialName {get; set;}
        public string ucosmicCode {get; set;}
        public string ucosmicForeignOfficialName {get; set;}
        public string ucosmicForeignCode {get; set;}
    }

}