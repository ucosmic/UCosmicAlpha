namespace UCosmic.Domain.Places
{
    public class MapPointView
    {
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool HasValue
        {
            get { return Latitude.HasValue && Longitude.HasValue; }
        }

        public MapPointView() { }

        public MapPointView(Coordinates entity)
        {
            Latitude = entity.Latitude;
            Longitude = entity.Longitude;
        }
    }
}