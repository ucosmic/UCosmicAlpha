using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentViewProjector : IHandleEvents<ApplicationStarted>, IHandleEvents<EstablishmentChanged>
    {
        private static readonly object UpdateLock = new object();
        private static bool _isUpdating;
        private readonly IQueryEntities _entities;
        private readonly IManageViews _viewManager;

        public EstablishmentViewProjector(IQueryEntities entities, IManageViews viewManager)
        {
            _entities = entities;
            _viewManager = viewManager;
        }

        private EstablishmentViews UpdateView(bool force = false)
        {
            lock (UpdateLock)
            {
                _isUpdating = true;
                var existing = _viewManager.Get<EstablishmentViews>();
                if (existing != null && !force)
                    return existing;

                var entities = _entities.Query<Establishment>()
                    .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                        {
                            x => x.Names.Select(y => y.TranslationToLanguage),
                            x => x.Urls,
                            x => x.Location.Places.Select(y => y.GeoPlanetPlace),
                            x => x.Parent,
                            x => x.Type,
                        })
                    .OrderBy(x => x.RevisionId)
                ;

                var view = new List<EstablishmentView>();
                foreach (var entity in entities)
                    view.Add(new EstablishmentView(entity));
                _viewManager.Set<EstablishmentViews>(view.ToArray());
                _isUpdating = false;
                return _viewManager.Get<EstablishmentViews>();
            }
        }

        internal EstablishmentViews GetView()
        {
            return _isUpdating
                ? _viewManager.Get<EstablishmentViews>()
                : UpdateView();
        }

        public void Handle(ApplicationStarted @event)
        {
            UpdateView(true);
        }

        public void Handle(EstablishmentChanged @event)
        {
            UpdateView(true);
        }
    }
}