using System;
using System.Linq;

namespace UCosmic.Domain.LanguageExpertises
{
    public class LanguageExpertiseById : BaseEntityQuery<LanguageExpertise>, IDefineQuery<LanguageExpertise>
    {
        public int Id { get; private set; }

        public LanguageExpertiseById(int inEntityId)
        {
            Id = inEntityId;
        }
    }

    public class HandleLanguageExpertiseByIdQuery : IHandleQueries<LanguageExpertiseById, LanguageExpertise>
    {
        private readonly IQueryEntities _entities;

        public HandleLanguageExpertiseByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public LanguageExpertise Handle(LanguageExpertiseById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<LanguageExpertise>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id);

            return result;
        }
    }
}
