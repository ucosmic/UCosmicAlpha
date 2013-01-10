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
