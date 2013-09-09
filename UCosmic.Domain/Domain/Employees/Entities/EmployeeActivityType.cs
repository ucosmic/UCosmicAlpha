namespace UCosmic.Domain.Employees
{
    public class EmployeeActivityType: Entity
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int Rank { get; set; }
        public string CssColor { get; set; }
        public int? IconLength { get; set; }
        public string IconMimeType { get; set; }
        public string IconName { get; set; }
        public string IconPath { get; set; }
        private string _iconFileName;
        public string IconFileName
        {
            get { return (string.IsNullOrWhiteSpace(_iconFileName)) ? IconName : _iconFileName; }
            set { _iconFileName = value; }
        }
    }
}
