using System;
using System.Collections.Generic;
//using System.Data;
using System.Data.Objects.SqlClient;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Establishments;
//using MoreLinq;

namespace UCosmic.Domain.LanguageExpertises
{
    //public class A
    //{
    //    public string TheData1 { get; set; }
    //    public string TheData2 { get; set; }
    //    public string UniqueID { get; set; }
    //}
    //public class AComparer : IEqualityComparer<A>
    //{

    //    #region IEqualityComparer<A> Members

    //    public bool Equals(A x, A y)
    //    {
    //        return x.UniqueID == y.UniqueID;
    //    }

    //    public int GetHashCode(A obj)
    //    {
    //        return obj.UniqueID.GetHashCode();
    //    }

    //    #endregion
    //}

    public class LanguageExpertisesPageByTerms : BaseEntitiesQuery<LanguageExpertise>, IDefineQuery<PagedQueryResult<LanguageExpertise>>
    {
        public LanguageExpertisesPageByTerms()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public string TwoLetterIsoCode { get; set; }
        public string Keyword { get; set; }
        public int? AncestorId { get; set; }
    }

    public class HandleLanguageExpertisesPageByTermsQuery : IHandleQueries<LanguageExpertisesPageByTerms, PagedQueryResult<LanguageExpertise>>
    {
        private readonly IProcessQueries _queries;
        private readonly IQueryEntities _entities;

        public HandleLanguageExpertisesPageByTermsQuery(IProcessQueries queries, IQueryEntities entities)
        {
            _queries = queries;
            _entities = entities;
        }

        public PagedQueryResult<LanguageExpertise> Handle(LanguageExpertisesPageByTerms query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<LanguageExpertise>()
                .EagerLoad(_entities, new Expression<Func<LanguageExpertise, object>>[]
                {
                    x => x.Language,
                    x => x.Person,
                    x => x.Language.Names,
                }); 
                //.EagerLoad(_entities, query.EagerLoad);

            if (query.EstablishmentId.HasValue)
            {
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == query.EstablishmentId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(query.EstablishmentDomain))
            {
                var establishment = _queries.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == establishment.RevisionId));
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

            if (!string.IsNullOrWhiteSpace(query.TwoLetterIsoCode))
            {
                queryable = queryable.Where(x => x.Language.TwoLetterIsoCode == query.TwoLetterIsoCode);
                    //!= null && x.Institution.Location.Places.Any(
                    //y => y.GeoPlanetPlace != null && y.GeoPlanetPlace.Country.Code == query.TwoLetterIsoCode));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                //var inName = queryable.Where(x => x.Language.Names.Contains(query.Keyword));
                var inDialect = queryable.Where(x => (x.Dialect != null && x.Dialect.Contains(query.Keyword)));
                var inName = queryable.Where(x => (x.Language.Names.Count() > 0 && (x.Language.Names.Where(y => y.Text.Contains(query.Keyword)).Count() > 0)));
                var inNativeName = queryable.Where(x => (x.Language.NativeName != null && x.Language.NativeName.Text.Contains(query.Keyword)));
                var inOther = queryable.Where(x => (x.Other != null && x.Other.Contains(query.Keyword)));
                //var inTwoLetterIsoCode = queryable.Where(x => (x.TwoLetterIsoCode != null && x.TwoLetterIsoCode.Contains(query.Keyword)));
                //var inYearAwarded = queryable.Where(x => (x.YearAwarded.HasValue && SqlFunctions.StringConvert((double)x.YearAwarded.Value).Contains(query.Keyword)));
                //var inEstablishment = queryable.Where(x => x.Institution != null && x.Institution.Names.Any(y => y.Text.Contains(query.Keyword)));
                //var inCountry = queryable.Where(x => x.Institution != null && x.Institution.Location.Places.Any(y => y.OfficialName.Contains(query.Keyword)));
                var inPerson = queryable.Where(x => x.Person.DisplayName.Contains(query.Keyword)).Distinct();
                //queryable = inName.Union(inDialect).Union(inPerson);
                //queryable = inName.Union(inDialect).Union(inNativeName).Union(inOther).Union(inPerson);
                queryable = inName.Union(inDialect).Union(inOther).Union(inPerson);
                //queryable = queryable.AsEnumerable().Distinct(new EqualityComparerTransaction());
                //queryable = inName.Concat(inDialect).Concat(inOther).Concat(inPerson).DistinctBy(x => x.PersonId);
            }

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<LanguageExpertise>(queryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
