using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Results;

namespace UCosmic.Domain.Places
{
    public class PlacesWithName : BaseEntitiesQuery<Place>, IDefineQuery<IQueryable<Place>>
    {
        public string Term { get; set; }
        public int MaxResults { get; set; }
        public StringMatchStrategy TermMatchStrategy { get; set; }
    }

    public class HandlePlacesWithNameQuery : IHandleQueries<PlacesWithName, IQueryable<Place>>
    {
        private readonly IQueryEntities _entities;

        public HandlePlacesWithNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<Place> Handle(PlacesWithName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            if (string.IsNullOrWhiteSpace(query.Term))
                throw new ValidationException(new[]
                {
                    new ValidationFailure("Term", "Term cannot be null or white space string.", query.Term),
                });

            if (query.MaxResults < 0)
                throw new ValidationException(new[]
                {
                    new ValidationFailure("MaxResults", "MaxResults must be greater than or equal to zero.", query.MaxResults),
                });

            var results = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
                .WithName(query.Term, query.TermMatchStrategy)
                .OrderBy(query.OrderBy);

            if (query.MaxResults > 0)
                results = results.Take(query.MaxResults);

            return results;
        }
    }
}
