namespace UCosmic.Domain.Establishments
{
    public class EstablishmentUrlView
    {
        public string Value { get; set; }

        public EstablishmentUrlView() { }

        public EstablishmentUrlView(EstablishmentUrl entity)
        {
            Value = entity.Value;
        }
    }
}