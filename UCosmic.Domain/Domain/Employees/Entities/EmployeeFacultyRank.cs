namespace UCosmic.Domain.Employees
{
    public class EmployeeFacultyRank : Entity
    {
        public int Id { get; set; }

        public int EstablishmentId { get; protected internal set; }
        public EmployeeModuleSettings Settings { get; protected set; }

        public string Rank { get; set; }
        public int? Number { get; set; }
    }
}
