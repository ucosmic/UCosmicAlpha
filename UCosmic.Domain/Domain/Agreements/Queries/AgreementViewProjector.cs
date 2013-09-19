using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Agreements
{
    public class AgreementViewProjector : IHandleEvents<ApplicationStarted>, IHandleEvents<AgreementChanged>
    {
        private static readonly object UpdateLock = new object();
        private static bool _isUpdating;
        private readonly IQueryEntities _entities;
        private readonly IManageViews _viewManager;

        public AgreementViewProjector(IQueryEntities entities, IManageViews viewManager)
        {
            _entities = entities;
            _viewManager = viewManager;
        }

        private IEnumerable<AgreementView> UpdateView(bool force = false)
        {
            lock (UpdateLock)
            {
                _isUpdating = true;
                var existing = _viewManager.Get<IEnumerable<AgreementView>>();
                if (existing != null && !force)
                    return existing;

                var entities = _entities.Query<Agreement>()
                    .EagerLoad(_entities, new Expression<Func<Agreement, object>>[]
                        {
                            x => x.Id,
                            x => x.Status,
                            x => x.StartsOn,
                            x => x.ExpiresOn,
                            x => x.Type,
                        })
                    .OrderBy(x => x.Id)
                ;

                var view = new List<AgreementView>();
                foreach (var entity in entities)
                    view.Add(new AgreementView(entity));
                _viewManager.Set<IEnumerable<AgreementView>>(view.ToArray());
                _isUpdating = false;
                return _viewManager.Get<IEnumerable<AgreementView>>();
            }
        }

        internal IEnumerable<AgreementView> GetView()
        {
            return _isUpdating
                ? _viewManager.Get<IEnumerable<AgreementView>>()
                : UpdateView();
        }

        public void Handle(ApplicationStarted @event)
        {
            UpdateView(true);
        }

        public void Handle(AgreementChanged @event)
        {
            UpdateView(true);
        }
    }
}