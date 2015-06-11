using System;
using System.Collections.Generic;


namespace UCosmic.Web.Mvc.Models
{
    // this class matches the columns used in the excel import, all other columns can be ignored.
    public class StudentImportApi
    {
        public int externalId { get; set; }
        public string status { get; set; }//in/out
        public int rank { get; set; }
        public string level {get; set;}//must match the level in the level table
        //rank//not needed as manually added - later have form for members to update
        public string termDescription {get; set;}
        public DateTime termEnd {get; set;}
        public DateTime termStart {get; set;}
        public string country {get; set;}
        //Student degree program
        public string progCode {get; set;}
        public string progDescription {get; set;}
        //Parent institution that is logged into uCosmic
        public string uCosmicAffiliation { get; set; }
        public int uCosmicAffiliationCode { get; set; }
        //Students institution -- this is the campus
        public string uCosmicStudentAffiliation { get; set; }
        public int uCosmicStudentAffiliationCode { get; set; }
        //Foreign affiliation... This is optional
        public string uCosmicForeignAffiliation {get; set; }
        public int uCosmicForeignAffiliationCode{get;set;}
    }

    public class StudentJSONApi
    {
        public IList<StudentActivity> students {get;set;}
        public StudentPager pager { get; set; }
    }

    public class StudentPager
    {
        public int page { get; set; }
        public int pageSize { get; set; }
        public int pageMax { get; set; }
        public int pageStart { get; set; }
        public int pageEnd { get; set; }
        public int numStudents { get; set; }
        public string order { get; set; }
        public string orderDirection { get; set; }
        public IList<StudentActivity> students { get; set; }
        public bool tracksForeign { get; set; }

        public StudentPager( IList<StudentActivity> students, int page, int pageSize, int numStudents, string order, string orderDirection, bool tracksForeign)
        {
            this.page = page;
            this.pageSize = pageSize;

            //Calculate pageMax
            this.pageMax = numStudents / pageSize;
            int r = (numStudents % pageSize) >= 1 ? 1 : 0;
            this.pageMax += r;

            this.pageStart = ((page - 1) * pageSize) + 1;
            this.pageEnd = page * pageSize;
            this.pageEnd = (this.pageEnd < numStudents) ? this.pageEnd : numStudents;

            this.numStudents = numStudents;

            this.order = order;
            this.orderDirection = orderDirection;

            this.students = students;
            this.tracksForeign = tracksForeign;
        }
    }

   

}