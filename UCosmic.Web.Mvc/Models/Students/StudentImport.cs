using Newtonsoft.Json;
using System;
using System.Collections.Generic;


namespace UCosmic.Web.Mvc.Models
{
    // this class matches the columns used in the excel import, all other columns can be ignored.
    public class StudentImportRequest
    {
        public string country { get; set; }
        //Student degree program
        //public string progCode {get; set;}//  ***********  move to firebase
        //public string progDescription {get; set;}
        //Parent institution that is logged into uCosmic
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string uCosmicAffiliation { get; set; }
        //Students institution -- this is the campus
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string uCosmicStudentAffiliation { get; set; }
        //Foreign affiliation... This is optional
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string uCosmicForeignAffiliation { get; set; }
    }

    public class Student_Import_Array
    {
        public StudentImportRequest[] student_import_request { get; set; }
    }

    public class StudentImportResponse
    {
        public int? placeId { get; set; }
        public int? uCosmicAffiliationId { get; set; }
        //Students institution -- this is the campus
        public int? uCosmicStudentAffiliationId { get; set; }
        //Foreign affiliation... This is optional
        public int? uCosmicForeignAffiliationId { get; set; }

        public StudentImportResponse(int? placeId, int? uCosmicAffiliationId, int? uCosmicStudentAffiliationId, int? uCosmicForeignAffiliationId)
        {
            this.placeId = placeId;
            this.uCosmicAffiliationId = uCosmicAffiliationId;
            this.uCosmicStudentAffiliationId = uCosmicStudentAffiliationId;
            this.uCosmicForeignAffiliationId = uCosmicForeignAffiliationId;
        }
    }




}