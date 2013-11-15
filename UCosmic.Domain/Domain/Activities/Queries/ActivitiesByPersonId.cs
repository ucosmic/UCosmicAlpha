using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByPersonId : BaseEntitiesQuery<ActivityValues>, IDefineQuery<PagedQueryResult<ActivityValues>>
    {
        public ActivitiesByPersonId(IPrincipal principal, int personId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
            PageSize = 10;
            PageNumber = 1;
        }

        public IPrincipal Principal { get; private set; }
        public int PersonId { get; private set; }

        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public string CountryCode { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleActivitiesByPersonIdQuery : IHandleQueries<ActivitiesByPersonId, PagedQueryResult<ActivityValues>>
    {
        private readonly IQueryEntities _entities;

        public HandleActivitiesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<ActivityValues> Handle(ActivitiesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var publicText = ActivityMode.Public.AsSentenceFragment();
            var queryable = _entities.Query<ActivityValues>()
                //.EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Activity.PersonId == query.PersonId && x.ModeText == publicText && x.Activity.ModeText == publicText && x.Activity.Original == null)
            ;

            //// when the query's country code is empty string, match all agreements regardless of country.
            //// when the query's country code is null, match agreements with partners that have no known country
            if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                //view = view.Where(x => x.Participants.Any(p => query.CountryCode.Equals(p.CountryCode, ordinalIgnoreCase)));
                //queryable = queryable.Where(x => x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry && z.GeoPlanetPlace != null && query.CountryCode.Equals(z.GeoPlanetPlace.Country.Code, StringComparison.OrdinalIgnoreCase))));
                queryable = queryable.Where(x => x.Locations.Any(y => y.Place.IsCountry && y.Place.GeoPlanetPlace != null && query.CountryCode.Equals(y.Place.GeoPlanetPlace.Country.Code, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                queryable = queryable.Where(x => (x.Title != null && x.Title.Contains(query.Keyword))
                    || x.Locations.Any(y => y.Place.IsCountry && y.Place.OfficialName.Contains(query.Keyword))
                    || x.Tags.Any(y => y.Text.Contains(query.Keyword))
                    || x.Types.Any(y => y.Type.Type.Contains(query.Keyword))
                );
            }

            queryable = queryable.OrderBy(query.OrderBy);
            
            var result = new PagedQueryResult<ActivityValues>(queryable, query.PageSize, query.PageNumber);
            return result;
        }
    }
}
