using System;
using System.Data.Objects.SqlClient;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Degrees
{
    public class DegreesPageByTerms : BaseEntitiesQuery<Degree>, IDefineQuery<PagedQueryResult<Degree>>
    {
        public DegreesPageByTerms()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public int? AncestorId { get; set; }
    }

    public class HandleDegreesPageByTermsQuery : IHandleQueries<DegreesPageByTerms, PagedQueryResult<Degree>>
    {
        private readonly IProcessQueries _queries;
        private readonly IQueryEntities _entities;

        public HandleDegreesPageByTermsQuery(IProcessQueries queries, IQueryEntities entities)
        {
            _queries = queries;
            _entities = entities;
        }

        public PagedQueryResult<Degree> Handle(DegreesPageByTerms query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Degree>()
                .EagerLoad(_entities, query.EagerLoad);

            queryable = queryable.Where(x => x.Person.IsActive == true);

            if (query.EstablishmentId.HasValue)
            {
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.EstablishmentId == query.EstablishmentId.Value));
                //queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == query.EstablishmentId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(query.EstablishmentDomain))
            {
                var establishment = _queries.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.EstablishmentId == establishment.RevisionId));
                //queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == establishment.RevisionId));
            }

            if (query.AncestorId.HasValue)
            {
                //queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.Establishment.Ancestors.Any(z => z.AncestorId == query.AncestorId.Value)));

                queryable = queryable.Where(x =>
                    x.Person.Affiliations.Any(y => y.IsDefault)
                        // make sure person's default affiliation is not null
                    &&
                    ( // person must be affiliated with this establishment or one of its offspring under the default affiliation
                        x.Person.Affiliations.Any(
                            y =>
                                (y.EstablishmentId == query.AncestorId.Value ||
                                 y.Establishment.Ancestors.Any(z => z.AncestorId == query.AncestorId.Value))
                                // ReSharper disable PossibleNullReferenceException
                                &&
                                (y.IsDefault ||
                                 y.Establishment.Ancestors.Any(
                                     z =>
                                         z.AncestorId ==
                                         x.Person.Affiliations.FirstOrDefault(a => a.IsDefault).EstablishmentId)))
                        // ReSharper restore PossibleNullReferenceException
                    )
                );
                //queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.EstablishmentId == query.EstablishmentId.Value));
            }

            if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                queryable = queryable.Where(x => x.Institution != null && x.Institution.Location.Places.Any(
                    y => y.GeoPlanetPlace != null && y.GeoPlanetPlace.Country.Code == query.CountryCode));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var inTitle = queryable.Where(x => x.Title.Contains(query.Keyword));
                var inFieldOfStudy = queryable.Where(x => (x.FieldOfStudy != null && x.FieldOfStudy.Contains(query.Keyword)));
                var inYearAwarded = queryable.Where(x => (x.YearAwarded.HasValue && SqlFunctions.StringConvert((double)x.YearAwarded.Value).Contains(query.Keyword)));
                var inEstablishment = queryable.Where(x => x.Institution != null && x.Institution.Names.Any(y => y.Text.Contains(query.Keyword)));
                var inCountry = queryable.Where(x => x.Institution != null && x.Institution.Location.Places.Any(y => y.OfficialName.Contains(query.Keyword)));
                var inPerson = queryable.Where(x => x.Person.DisplayName.Contains(query.Keyword));
                queryable = inTitle.Union(inFieldOfStudy).Union(inYearAwarded).Union(inEstablishment).Union(inCountry).Union(inPerson);
            }

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Degree>(queryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
