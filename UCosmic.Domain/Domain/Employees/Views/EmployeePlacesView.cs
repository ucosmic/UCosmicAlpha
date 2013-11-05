namespace UCosmic.Domain.Employees
{
    public class EmployeePlacesView
    {
        public EmployeePlacesView()
        {
            ActivityPersonIds = new int[0];
            ActivityIds = new int[0];
        }

        public int EstablishmentId { get; set; }
        public int? PlaceId { get; set; }
        public string PlaceName { get; set; }
        public bool IsCountry { get; set; }
        public string CountryCode { get; set; }
        public int[] ActivityPersonIds { get; set; }
        public int[] ActivityIds { get; set; }
        public EmployeePlaceActivityTypesView[] ActivityTypes { get; set; }
    }
}
