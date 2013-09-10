using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using UCosmic.Domain.Establishments;


namespace UCosmic.Domain.Activities
{
    public class ActivityViewProjector : IActivityViewProjector
                                         ,IHandleEvents<ApplicationStarted>
                                         //,IHandleEvents<ActivityCreated>
                                         //,IHandleEvents<ActivityChanged>
                                         //,IHandleEvents<ActivityDeleted>
                                         //,IHandleEvents<EstablishmentChanged>
                                         //,IHandleEvents<AffiliationChanged>
    {
        private static readonly ReaderWriterLockSlim Rwlock = new ReaderWriterLockSlim();
        private static readonly ReaderWriterLockSlim StatsRwlock = new ReaderWriterLockSlim();
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queries;
        private readonly IManageViews _viewManager;

        public ActivityViewProjector(IQueryEntities entities,
                                     IProcessQueries queries,
                                     IManageViews viewManager)
        {
            _entities = entities;
            _queries = queries;
            _viewManager = viewManager;
        }

        public void BuildViews()
        {
            var entities = _entities.Query<Activity>();
            
            /* ------ Construct the general view. ----- */

            var view = new List<ActivityView>();
            Rwlock.EnterWriteLock();

            try
            {
                

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

                Debug.WriteLine(DateTime.Now + " ActivityView build complete with " + view.Count + " activities.");
            }


            /* ----- Construct the stats views ----- */

            StatsRwlock.EnterWriteLock();

            try
            {
                var establishmentsWithPeopleWithActivities =
                    _queries.Execute(new EstablishmentsWithPeopleWithActivities());

                foreach (var establishment in establishmentsWithPeopleWithActivities)
                {
                    var globalCounts = new ActivityGlobalActivityCountView(_queries, _entities, establishment.RevisionId);
                    var dictionary = new Dictionary<int, ActivityGlobalActivityCountView>();
                    dictionary.Add(establishment.RevisionId, globalCounts);
                    _viewManager.Set<Dictionary<int, ActivityGlobalActivityCountView>>(dictionary);
                }

                foreach (var establishment in establishmentsWithPeopleWithActivities)
                {
                    var globalCounts = new ActivityGlobalPeopleCountView(_queries, _entities, establishment.RevisionId);
                    var dictionary = new Dictionary<int, ActivityGlobalPeopleCountView>();
                    dictionary.Add(establishment.RevisionId, globalCounts);
                    _viewManager.Set<Dictionary<int, ActivityGlobalPeopleCountView>>(dictionary);
                }
            }
            finally
            {
                StatsRwlock.ExitWriteLock();

                Debug.WriteLine(DateTime.Now + " ActivityView build complete with " + view.Count + " activities.");
            }
        }

#if false
        private void UpdateActivity(int activityId, ActivityMode activityMode)
        {
            if (activityMode == ActivityMode.Public)
            {
                var view = _viewManager.Get<ICollection<ActivityView>>();
                if (view != null) // if null, could signify that ApplicationStarted build is not yet complete.
                {
                    Rwlock.EnterWriteLock();

                    try
                    {
                        var entity = _entities.Query<Activity>().SingleOrDefault(a => a.RevisionId == activityId);
                        if ((entity != null) &&
                            (entity.Mode == ActivityMode.Public) &&
                            (entity.EditSourceId == null))
                        {
                            var existingActivityView = view.SingleOrDefault(a => a.Id == entity.RevisionId);
                            if (existingActivityView != null)
                            {
                                view.Remove(existingActivityView);                               
                            }

                            view.Add(new ActivityView(entity));

                            _viewManager.Set<ICollection<ActivityView>>(view);
                        }
                    }
                    finally
                    {
                        Rwlock.ExitWriteLock();
                        Debug.WriteLine(DateTime.Now + " ActivityView update activity complete with " + view.Count + " activities.");
                    }
                }
            }
        }

        private void DeleteActivity(int activityId)
        {
            var view = _viewManager.Get<ICollection<ActivityView>>();
            if (view != null) // if null, could signify that ApplicationStarted build is not yet complete.
            {
                Rwlock.EnterWriteLock();

                try
                {
                    var activityView = view.SingleOrDefault(a => a.Id == activityId);
                    if (activityView != null)
                    {
                        view.Remove(activityView);

                        _viewManager.Set<ICollection<ActivityView>>(view);
                    }
                }
                finally
                {
                    Rwlock.ExitWriteLock();
                    Debug.WriteLine(DateTime.Now + " ActivityView delete activity complete with " + view.Count + " activities.");
                }
            }
        }
#endif

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

#if DEBUG
            if (view == null)
            {
                Debug.WriteLine(DateTime.Now + " >>> ActivityView is NULL <<<");
            }
#endif

            return view;
        }

        public void EndReadView()
        {
            Rwlock.ExitReadLock();
        }

        public ActivityGlobalActivityCountView BeginReadActivityCountsView(int establishmentId)
        {
            StatsRwlock.EnterReadLock();
            var views = _viewManager.Get<Dictionary<int, ActivityGlobalActivityCountView>>();
            return (views != null) ? views.SingleOrDefault(v => v.Key == establishmentId).Value : null;
        }

        public void EndReadActivityCountsView()
        {
            StatsRwlock.ExitReadLock();
        }

        public ActivityGlobalPeopleCountView BeginReadPeopleCountsView(int establishmentId)
        {
            StatsRwlock.EnterReadLock();
            var views = _viewManager.Get<Dictionary<int, ActivityGlobalPeopleCountView>>();
            return (views != null) ? views.SingleOrDefault(v => v.Key == establishmentId).Value : null;
        }

        public void EndReadPeopleCountsView()
        {
            StatsRwlock.ExitReadLock();
        }

        public void Handle(ApplicationStarted @event)
        {
            BuildViews();
        }

#if false
        public void Handle(ActivityChanged @event)
        {
            UpdateActivity(@event.ActivityId, @event.ActivityMode);
        }

        public void Handle(ActivityCreated @event)
        {
            BuildViews();
        }

        public void Handle(ActivityDeleted @event)
        {
            DeleteActivity(@event.ActivityId);
        }

        public void Handle(EstablishmentChanged @event)
        {
            BuildViews();
        }

        public void Handle(AffiliationChanged @event)
        {
            BuildViews();
        }
#endif
    }
}
