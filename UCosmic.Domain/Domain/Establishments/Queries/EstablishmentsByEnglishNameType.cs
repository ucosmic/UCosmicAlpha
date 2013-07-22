using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByEnglishNameType : BaseEntityQuery<Establishment>, IDefineQuery<Establishment[]>
    {
        public string EnglishNameType { get; private set; }

        public EstablishmentsByEnglishNameType(string englishNameType)
        {
            if (string.IsNullOrWhiteSpace(englishNameType))
                throw new ArgumentException("Cannot be empty or white space.", "englishNameType");

            EnglishNameType = englishNameType;
        }
    }

    public class HandleEstablishmentsByEnglishNameTypeQuery : IHandleQueries<EstablishmentsByEnglishNameType, Establishment[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentsByEnglishNameTypeQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment[] Handle(EstablishmentsByEnglishNameType query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Establishment>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .Where(x => String.Compare(x.Type.EnglishName, query.EnglishNameType, true) == 0).ToArray();
        }
    }
}
