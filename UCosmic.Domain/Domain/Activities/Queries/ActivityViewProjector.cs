using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;


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

        private Dictionary<int, GlobalActivityCountView> _globalActivityDictionary { get; set; }
        private Dictionary<int, GlobalPeopleCountView> _globalPeopleDictionary { get; set; }

        public ActivityViewProjector(IQueryEntities entities,
                                     IProcessQueries queries,
                                     IManageViews viewManager)
        {
            _entities = entities;
            _queries = queries;
            _viewManager = viewManager;
            _globalActivityDictionary = new Dictionary<int, GlobalActivityCountView>();
            _globalPeopleDictionary = new Dictionary<int, GlobalPeopleCountView>();
        }

        public void BuildViews()
        {
#if DEBUG
            var buildTimer = new Stopwatch();
            buildTimer.Start();
#endif
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
#if DEBUG
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
#endif
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

                /* ----- Global activity counts per establishment ----- */

                _globalActivityDictionary = _viewManager.Get<Dictionary<int, GlobalActivityCountView>>();
                if (_globalActivityDictionary == null)
                {
                    _viewManager.Set<Dictionary<int, GlobalActivityCountView>>(
                        new Dictionary<int, GlobalActivityCountView>());
                    _globalActivityDictionary = _viewManager.Get<Dictionary<int, GlobalActivityCountView>>();
                }
                _globalActivityDictionary.Clear();

                foreach (var establishment in establishmentsWithPeopleWithActivities)
                {
                    int establishmentId = establishment.RevisionId;
                    var stats = new GlobalActivityCountView {EstablishmentId = establishmentId};

                    stats.TypeCounts = new Collection<ActivityViewStats.TypeCount>();
                    stats.PlaceCounts = new Collection<ActivityViewStats.PlaceCount>();

                    var settings = _queries.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

                    DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                    DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
                                               ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                               : new DateTime(DateTime.MinValue.Year, 1, 1);

                    stats.CountOfPlaces = 0;
                    stats.Count = 0;

                    IEnumerable<Place> places = _entities.Query<Place>()
                                                         .Where(p => p.IsCountry || p.IsWater || p.IsEarth);
                    foreach (var place in places)
                    {
                        int activityCount =
                            _queries.Execute(
                                new ActivityCountByPlaceIdsEstablishmentId(new int[] {place.RevisionId},
                                                                           establishmentId,
                                                                           fromDateUtc,
                                                                           toDateUtc,
                                                                           false, /* include undated */
                                                                           true /* include future */));

                        stats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = activityCount
                        });

                        stats.Count += activityCount;

                        if (activityCount > 0)
                        {
                            stats.CountOfPlaces += 1;
                        }

                        if ((settings != null) && settings.ActivityTypes.Any())
                        {
                            foreach (var type in settings.ActivityTypes)
                            {
                                int placeTypeCount = _queries.Execute(
                                    new ActivityCountByTypeIdPlaceIdsEstablishmentId(type.Id,
                                                                                     new int[] {place.RevisionId},
                                                                                     establishmentId,
                                                                                     fromDateUtc,
                                                                                     toDateUtc,
                                                                                     false, /* include undated */
                                                                                     true /* include future */));

                                var typeCount = stats.TypeCounts.SingleOrDefault(t => t.TypeId == type.Id);
                                if (typeCount != null)
                                {
                                    typeCount.Count += placeTypeCount;
                                }
                                else
                                {
                                    typeCount = new ActivityViewStats.TypeCount
                                    {
                                        TypeId = type.Id,
                                        Type = type.Type,
                                        Count = placeTypeCount,
                                        Rank = type.Rank
                                    };

                                    stats.TypeCounts.Add(typeCount);
                                }
                            }

                            stats.TypeCounts = stats.TypeCounts.OrderBy(t => t.Rank).ToList();
                        }
                    }

                    _globalActivityDictionary.Remove(establishmentId);
                    _globalActivityDictionary.Add(establishmentId, stats);
                }

                _viewManager.Set<Dictionary<int, GlobalActivityCountView>>(_globalActivityDictionary);

                /* ----- Global people counts per establishment ----- */

                _globalPeopleDictionary = _viewManager.Get<Dictionary<int, GlobalPeopleCountView>>();
                if (_globalPeopleDictionary == null)
                {
                    _viewManager.Set<Dictionary<int, GlobalPeopleCountView>>(
                        new Dictionary<int, GlobalPeopleCountView>());
                    _globalPeopleDictionary = _viewManager.Get<Dictionary<int, GlobalPeopleCountView>>();
                }
                _globalPeopleDictionary.Clear();


                foreach (var establishment in establishmentsWithPeopleWithActivities)
                {
                    int establishmentId = establishment.RevisionId;
                    var stats = new GlobalPeopleCountView {EstablishmentId = establishmentId};

                    stats.TypeCounts = new Collection<ActivityViewStats.TypeCount>();
                    stats.PlaceCounts = new Collection<ActivityViewStats.PlaceCount>();

                    var settings = _queries.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

                    DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                    DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
                                               ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                               : new DateTime(DateTime.MinValue.Year, 1, 1);

                    stats.CountOfPlaces = 0;
                    stats.Count = _queries.Execute(new PeopleWithActivitiesCountByEstablishmentId(establishmentId,
                                                                                                  fromDateUtc,
                                                                                                  toDateUtc));

                    IEnumerable<Place> places = _entities.Query<Place>()
                                                         .Where(p => p.IsCountry || p.IsWater || p.IsEarth);
                    foreach (var place in places)
                    {
                        int peopleCount =
                            _queries.Execute(
                                new PeopleWithActivitiesCountByPlaceIdsEstablishmentId(new int[] {place.RevisionId},
                                                                                       establishmentId,
                                                                                       fromDateUtc,
                                                                                       toDateUtc,
                                                                                       false, /* include undated */
                                                                                       true /* include future */));

                        stats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = peopleCount
                        });

                        if (peopleCount > 0)
                        {
                            stats.CountOfPlaces += 1;
                        }
                    }

                    if ((settings != null) && settings.ActivityTypes.Any())
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            int globalTypeCount = _queries.Execute(
                                new PeopleWithActivitiesCountByTypeIdEstablishmentId(type.Id,
                                                                                     establishmentId,
                                                                                     fromDateUtc,
                                                                                     toDateUtc,
                                                                                     false, /* include undated */
                                                                                     true /* include future */));

                            var typeCount = stats.TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);
                            if (typeCount != null)
                            {
                                typeCount.Count += globalTypeCount;
                            }
                            else
                            {
                                typeCount = new ActivityViewStats.TypeCount
                                {
                                    TypeId = type.Id,
                                    Type = type.Type,
                                    Count = globalTypeCount,
                                    Rank = type.Rank
                                };

                                stats.TypeCounts.Add(typeCount);
                            }
                        }

                        stats.TypeCounts = stats.TypeCounts.OrderBy(t => t.Rank).ToList();
                    }

                    _globalPeopleDictionary.Remove(establishmentId);
                    _globalPeopleDictionary.Add(establishmentId, stats);
                }

                _viewManager.Set<Dictionary<int, GlobalPeopleCountView>>(_globalPeopleDictionary);
            }
#if DEBUG
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
#endif
            finally
            {
                StatsRwlock.ExitWriteLock();
                Debug.WriteLine(DateTime.Now + " Activity stats done building.");
            }

#if DEBUG
            buildTimer.Stop();
            Debug.WriteLine(DateTime.Now + " Activity views build time: " + buildTimer.Elapsed.TotalMinutes + " mins.");
#endif
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
            public
            ICollection<ActivityView> BeginReadView()
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

        public GlobalActivityCountView BeginReadActivityCountsView(int establishmentId)
        {
            StatsRwlock.EnterReadLock();
            if (_globalActivityDictionary.Count == 0)
            {
                _globalActivityDictionary = _viewManager.Get<Dictionary<int, GlobalActivityCountView>>();
            }
            return _globalActivityDictionary.Values.SingleOrDefault(v => v.EstablishmentId == establishmentId);
        }

        public void EndReadActivityCountsView()
        {
            StatsRwlock.ExitReadLock();
        }

        public GlobalPeopleCountView BeginReadPeopleCountsView(int establishmentId)
        {
            StatsRwlock.EnterReadLock();
            if (_globalPeopleDictionary.Count == 0)
            {
                _globalPeopleDictionary = _viewManager.Get<Dictionary<int, GlobalPeopleCountView>>();
            }
            return _globalPeopleDictionary.Values.SingleOrDefault(v => v.EstablishmentId == establishmentId);
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
