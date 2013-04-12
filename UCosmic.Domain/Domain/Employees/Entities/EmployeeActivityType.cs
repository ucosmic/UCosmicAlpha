namespace UCosmic.Domain.Employees
{
    public class EmployeeActivityType: Entity
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int Rank { get; set; }
    }
}
