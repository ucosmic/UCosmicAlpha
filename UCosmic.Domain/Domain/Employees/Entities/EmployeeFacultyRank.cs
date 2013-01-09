using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Employees
{
    public class EmployeeFacultyRank : Entity
    {
        public EmployeeFacultyRank()
        {
        }

        public int EmployeeFacultyRankId { get; set; }
        public string Rank { get; set; }
    }
}
