using System.Collections.ObjectModel;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentCategory : Entity
    {
        protected internal EstablishmentCategory()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Types = new Collection<EstablishmentType>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public string Code { get; protected internal set; }
        public virtual Collection<EstablishmentType> Types { get; protected set; }
        public string EnglishName { get; protected internal set; }
        public string EnglishPluralName { get; protected internal set; }
    }
}