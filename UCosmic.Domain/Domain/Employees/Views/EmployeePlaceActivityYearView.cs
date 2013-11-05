namespace UCosmic.Domain.Employees
{
    public class EmployeePlaceActivityYearView
    {
        public EmployeePlaceActivityYearView()
        {
            ActivityPersonIds = new int[0];
            ActivityIds = new int[0];
        }

        public int Year { get; set; }
        public int[] ActivityPersonIds { get; set; }
        public int[] ActivityIds { get; set; }
    }
}