using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

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
                        })
                .OrderBy(x => x.RevisionId)
            ;
            var view = entities.Select(x =>
                new EstablishmentView
                {
                    RevisionId = x.RevisionId,
                    OfficialName = x.OfficialName,
                    WebsiteUrl = x.WebsiteUrl,
                    Names = x.Names.Select(y => new EstablishmentNameView
                        {
                            Text = y.Text,
                            AsciiEquivalent = y.AsciiEquivalent,
                        }),
                    Urls = x.Urls.Select(y => new EstablishmentUrlView
                        {
                            Value = y.Value,
                        })
                });
            _viewManager.Set<IEnumerable<EstablishmentView>>(view);
        }

        public PagedQueryResult<EstablishmentView> Handle(EstablishmentsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            //if (string.IsNullOrWhiteSpace(query.Term))
            //    throw new ValidationException(new[]
            //{
            //    new ValidationFailure("Term", "Term cannot be null or white space string", query.Term),
            //});

            //if (query.MaxResults < 0)
            //    throw new ValidationException(new[]
            //{
            //    new ValidationFailure("MaxResults", "MaxResults must be greater than or equal to zero", query.MaxResults),
            //});

            //var results = _entities.Query<Establishment>()
            //    //.EagerLoad(_entities, query.EagerLoad)
            //    //.WithNameOrUrl(query.Term, query.TermMatchStrategy)
            //    //.OrderBy(query.OrderBy)
            //;

            //if (query.MaxResults > 0)
            //    results = results.Take(query.MaxResults);

            //return results.ToArray();

            var view = GetView().AsQueryable();

            var pagedResults = new PagedQueryResult<EstablishmentView>(view, query.Pager);

            return pagedResults;
        }
    }
}