namespace UCosmic.Domain.Establishments
{
    public class EstablishmentTypeView
    {
        public int Id { get; set; }
        public string EnglishName { get; set; }

        public EstablishmentTypeView() { }

        public EstablishmentTypeView(EstablishmentType entity)
        {
            Id = entity.RevisionId;
            EnglishName = entity.EnglishName;
        }
    }
}