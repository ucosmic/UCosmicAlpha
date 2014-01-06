using System;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityValuesByTerms : IDefineQuery<IQueryable<ActivityValues>>
    {
        internal ActivityValuesByTerms()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int[] PlaceIds { get; set; }
        //public string CountryCode { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public bool? IncludeUndated { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleActivityValuesByTermsQuery : IHandleQueries<ActivityValuesByTerms, IQueryable<ActivityValues>>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private static readonly string PublicText = ActivityMode.Public.AsSentenceFragment();

        public HandleActivityValuesByTermsQuery(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public IQueryable<ActivityValues> Handle(ActivityValuesByTerms query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityValues>()
                .Where(x => x.ModeText == PublicText && x.Activity.ModeText == PublicText && x.Activity.Original == null)
            ;

            if (query.EstablishmentId.HasValue)
            {
                queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == query.EstablishmentId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(query.EstablishmentDomain))
            {
                var establishment = _queryProcessor.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == establishment.RevisionId));
            }

            if (query.ActivityTypeIds != null && query.ActivityTypeIds.Any())
            {
                queryable = queryable.Where(x => x.Types.Any(y => query.ActivityTypeIds.Contains(y.TypeId)));
            }

            // exclude undated items only when specified as false
            if (query.IncludeUndated.HasValue && !query.IncludeUndated.Value)
            {
                queryable = queryable.Where(x => x.StartsOn.HasValue || x.EndsOn.HasValue);
            }

            if (query.PlaceIds != null && query.PlaceIds.Any())
            {
                var placeTag = ActivityTagDomainType.Place.AsSentenceFragment();
                var componentIds = _entities.Query<Place>().Where(x => query.PlaceIds.Contains(x.RevisionId))
                    .SelectMany(x => x.Components.Select(y => y.RevisionId)).ToArray();
                var placeIds = query.PlaceIds.Union(componentIds).ToArray();
                queryable = queryable.Where(x =>
                    x.Locations.Any(y =>
                        placeIds.Contains(y.PlaceId) // match place exactly

                            // match place's ancestors to queried placeId, unless global
                        || (y.Place.Ancestors.Any(z => placeIds.Except(new[] { 1 }).Contains(z.AncestorId)))
                    )
                        // match based on place tags
                    || x.Tags.Any(y => y.DomainTypeText == placeTag && y.DomainKey.HasValue && placeIds.Contains(y.DomainKey.Value))
                );
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                // SQL Server can't handle a complex query like this with eager loading, so we break it up
                // query locations separately from other fields, then get the id's of each separate query, then union them together
                queryable = queryable.Where(x => (x.Title != null && x.Title.Contains(query.Keyword))
                //var nonLocationQueryable = queryable.Where(x => (x.Title != null && x.Title.Contains(query.Keyword))
                    || (x.ContentSearchable != null && x.ContentSearchable.Contains(query.Keyword))
                    || x.Activity.Person.DisplayName.Contains(query.Keyword)
                    || x.Tags.Any(y => y.Text.Contains(query.Keyword))
                    || x.Types.Any(y => y.Type.Type.Contains(query.Keyword))
                );
                //var locationQueryable = queryable.Where(x => x.Locations.Any(y => y.Place.OfficialName.Contains(query.Keyword)));
                //var nonLocationIds = nonLocationQueryable.Select(x => x.RevisionId);
                //var locationIds = locationQueryable.Select(x => x.RevisionId);
                //var ids = nonLocationIds.Union(locationIds).Distinct().ToArray();
                //queryable = _entities.Query<ActivityValues>().Where(x => ids.Contains(x.RevisionId));
            }

            return queryable;
        }
    }
}
