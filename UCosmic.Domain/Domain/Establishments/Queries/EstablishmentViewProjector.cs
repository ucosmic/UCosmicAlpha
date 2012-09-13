using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentViewProjector : IHandleEvents<ApplicationStarted>
    {
        private readonly IQueryEntities _entities;
        private readonly IManageViews _viewManager;

        public EstablishmentViewProjector(IQueryEntities entities, IManageViews viewManager)
        {
            _entities = entities;
            _viewManager = viewManager;
        }

        internal IEnumerable<EstablishmentView> GetView()
        {
            var view = _viewManager.Get<IEnumerable<EstablishmentView>>();
            if (view == null)
            {
                UpdateView();
                return GetView();
            }
            return view;
        }

        private void UpdateView()
        {
            var entities = _entities.Query<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                        {
                            x => x.Names.Select(y => y.TranslationToLanguage),
                            x => x.Urls,
                            x => x.Location.Places.Select(y => y.GeoPlanetPlace),
                        })
                .OrderBy(x => x.RevisionId)
            ;

            var view = new List<EstablishmentView>();
            foreach (var entity in entities)
                view.Add(new EstablishmentView(entity));
            _viewManager.Set<IEnumerable<EstablishmentView>>(view.ToArray());
        }

        public void Handle(ApplicationStarted @event)
        {
            UpdateView();
        }
    }
}