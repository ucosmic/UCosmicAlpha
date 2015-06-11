using System;
using UCosmic.Domain.Establishments;
using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class UploadInfo
    {
        public int success  {get;set;}
        public int nullID   {get;set; }
        public List<String> noEstablishmentList { get; set; }
        public List<String> noInstitutionList { get; set; }
        public List<String> duplicateList       { get; set; }
        public List<String> failureList         { get; set; }
        public List<String> noPlaceList { get; set; }

        public UploadInfo()
        {
            this.success = 0;
            this.nullID = 0;
            this.noEstablishmentList = new List<string>();
            this.duplicateList = new List<string>();
            this.failureList = new List<string>();
            this.noPlaceList = new List<string>();
            this.noInstitutionList = new List<string>();
        }
    }
}