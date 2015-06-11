using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using UCosmic.Domain.Establishments;
using System.Collections.Generic;


namespace UCosmic.Web.Mvc.Models
{
    public class StudentDataFilters
    {
        //Establishments had a circular reference so JSON was not a fan...
        public IEnumerable<string> campusList { get; set; }
        public IList<string> continents { get; set; }
        public IList<string> countries { get; set; }
        public IList<StudentProgramData> programs { get; set; }
        public IList<StudentTermData> terms { get; set; }

        public StudentDataFilters(ICollection<Establishment> campusList, IList<string> continents, IList<string> countries,
                                  IList<StudentProgramData> programs, IList<StudentTermData> terms)
        {
            this.campusList     = campusList.Select(x => x.OfficialName);
            this.continents     = continents;
            this.countries      = countries;
            this.programs       = programs;
            this.terms          = terms;
        }
    }
}