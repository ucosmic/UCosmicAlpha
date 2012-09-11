using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByKeyword : BaseViewsQuery<EstablishmentView>, IDefineQuery<PagedQueryResult<EstablishmentView>>
    {
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public PagedQueryRequest Pager { get; set; }
    }

    public class HandleEstablishmentsByKeywordQuery : IHandleQueries<EstablishmentsByKeyword, PagedQueryResult<EstablishmentView>>
    {
        private readonly IQueryEntities _entities;
        private readonly IManageViews _viewManager;

        public HandleEstablishmentsByKeywordQuery(IQueryEntities entities, IManageViews viewManager)
        {
            _entities = entities;
            _viewManager = viewManager;
        }

        private IEnumerable<EstablishmentView> GetView()
        {
            var view = _viewManager.Get<IEnumerable<EstablishmentView>>();
            if (view == null)
            {
                CreateView();
                return GetView();
            }
            return view;
        }

        private void CreateView()
        {
            var entities = _entities.Query<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                        {
                            x => x.Names,
                            x => x.Urls,
                            x => x.Location.Places.Select(y => y.GeoPlanetPlace),
                            x => x.Ancestors.Select(y => y.Ancestor.Location.Places.Select(z => z.GeoPlanetPlace))
                        })
                .OrderBy(x => x.RevisionId)
            ;

            var view = Mapper.Map<IEnumerable<EstablishmentView>>(entities);
            _viewManager.Set<IEnumerable<EstablishmentView>>(view);
        }

        public PagedQueryResult<EstablishmentView> Handle(EstablishmentsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var view = GetView().AsQueryable();
            
            // when the query's country code is empty string, match all establishments regardless of country.
            // when the query's country code is null, match establishments without country
            if (query.CountryCode == null)
            {
                view = view.Where(x => string.IsNullOrWhiteSpace(x.CountryCode));
            }
            // when the country code is specified, match establishments with country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                view = view.Where(x => x.CountryCode.Equals(query.CountryCode, StringComparison.OrdinalIgnoreCase));
            }

            var pagedResults = new PagedQueryResult<EstablishmentView>(view, query.Pager);

            return pagedResults;
        }
    }
}