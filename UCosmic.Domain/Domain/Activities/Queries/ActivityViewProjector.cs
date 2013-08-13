using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class ActivityViewProjector : IHandleEvents<ApplicationStarted>,
                                         IHandleEvents<PublicActivityChanged>,
                                         IHandleEvents<EstablishmentChanged>,
                                         IHandleEvents<AffiliationChanged>
    {
        private static readonly ReaderWriterLockSlim Rwlock = new ReaderWriterLockSlim();
        private readonly IQueryEntities _entities;
        private readonly IProcessEvents _eventProcessor;
        private readonly IManageViews _viewManager;

        public ActivityViewProjector(IQueryEntities entities,
                                     IManageViews viewManager,
                                     IProcessEvents eventProcessor)
        {
            _entities = entities;
            _viewManager = viewManager;
            _eventProcessor = eventProcessor;
        }

        private void BuildView()
        {
            Rwlock.EnterWriteLock();

            try
            {
                var entities = _entities.Query<Activity>();

                var view = new List<ActivityView>();

                foreach (var entity in entities)
                {
                    /* Only public activities. Do not include edit-copy activities */
                    if ((entity.Mode == ActivityMode.Public) &&
                        (entity.EditSourceId == null))
                    {
                        view.Add(new ActivityView(entity));
                    }
                }

                _viewManager.Set<ICollection<ActivityView>>(view);
            }
            finally
            {
                Rwlock.ExitWriteLock();
            }
        }

        private void UpdateActivity(int activityId)
        {
            var list = _viewManager.Get<ICollection<ActivityView>>();
            if (list != null) // if null, could signify that ApplicationStarted build is not yet complete.
            {
                Rwlock.EnterWriteLock();

                try
                {
                    var entity = _entities.Query<Activity>().SingleOrDefault(a => a.RevisionId == activityId);
                    if (entity != null)
                    {
                        var activityView = list.SingleOrDefault(a => a.Id == entity.RevisionId);
                        if (activityView != null)
                        {
                            list.Remove(activityView);
                            list.Add(new ActivityView(entity));
                        }
                    }
                }
                finally
                {
                    Rwlock.ExitWriteLock();
                }
            }
        }

        /*
         * Each call to BeginReadView() must be matched with EndReadView().
         * This method may return null.
         */
        public ICollection<ActivityView> BeginReadView()
        {
            ICollection<ActivityView> view = null;

            Rwlock.EnterReadLock();

            /* This may return null if the ApplicationStarted view has not completed building. */
            view = _viewManager.Get<ICollection<ActivityView>>();

            return view;
        }

        public void EndReadView()
        {
            Rwlock.ExitReadLock();
        }
 
        public void Handle(ApplicationStarted @event)
        {
            BuildView();
        }

        public void Handle(PublicActivityChanged @event)
        {
            UpdateActivity(@event.ActivityId);
        }

        public void Handle(EstablishmentChanged @event)
        {
            BuildView();
        }

        public void Handle(AffiliationChanged @event)
        {
            BuildView();
        }
    }
}
