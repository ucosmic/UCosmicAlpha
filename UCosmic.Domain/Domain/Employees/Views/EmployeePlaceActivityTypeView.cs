namespace UCosmic.Domain.Employees
{
    public class EmployeePlaceActivityTypeView
    {
        public EmployeePlaceActivityTypeView()
        {
            ActivityPersonIds = new int[0];
            ActivityIds = new int[0];
        }

        public int ActivityTypeId { get; set; }
        public string Text { get; set; }
        public int Rank { get; set; }
        public bool HasIcon { get; set; }
        public int[] ActivityPersonIds { get; set; }
        public int[] ActivityIds { get; set; }
    }
}