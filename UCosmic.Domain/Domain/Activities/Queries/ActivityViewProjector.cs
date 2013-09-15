using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;


namespace UCosmic.Domain.Activities
{
    public class ActivityViewProjector : IActivityViewProjector , IHandleEvents<ApplicationStarted>
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
        private readonly ILogExceptions _exceptionLogger;

        private Dictionary<int, GlobalActivityCountView> _globalActivityDictionary = new Dictionary<int, GlobalActivityCountView>();
        private Dictionary<int, GlobalPeopleCountView> _globalPeopleDictionary = new Dictionary<int, GlobalPeopleCountView>();

        public ActivityViewProjector(IQueryEntities entities, IProcessQueries queries, IManageViews viewManager, ILogExceptions exceptionLogger)
        {
            _entities = entities;
            _queries = queries;
            _viewManager = viewManager;
            _exceptionLogger = exceptionLogger;
        }

        public void BuildViews()
        {
            var buildTimer = new Stopwatch();
            buildTimer.Start();

            #region Build ActivityViews

            var view = new List<ActivityView>();
            Rwlock.EnterWriteLock();

            try
            {
                var publicText = ActivityMode.Public.AsSentenceFragment();
                var activityViewEntities = _entities.Query<Activity>()
                    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                    {
                        // load everything needed by the activityview constructor
                        x => x.Values.Select(y => y.Locations),
                        x => x.Values.Select(y => y.Types),
                        x => x.Person.Affiliations.Select(y => y.Establishment.Ancestors),
                    })
                    // filter out non-public & edit-sourced activities before executing query
                    .Where(x => x.ModeText == publicText && !x.EditSourceId.HasValue)
                    .ToArray() // execute query
                ;
                view.AddRange(activityViewEntities.Select(x => new ActivityView(x)));
                _viewManager.Set<ICollection<ActivityView>>(view);
            }
            catch (Exception ex)
            {
                _exceptionLogger.Log(ex);
                WriteOutput("A '{0}' exception was thrown while trying to build activity views.", ex.GetType().Name);
            }
            finally
            {
                Rwlock.ExitWriteLock();
                WriteOutput("ActivityView build completed in {0} milliseconds with {1} activities.", MillisecondsSinceLast(buildTimer), view.Count);
            }

            #endregion
            #region Build GlobalActivityCountViews & GlobalPeopleCountViews

            StatsRwlock.EnterWriteLock();

            try
            {
                #region Initialize GlobalActivityCountView dictionary

                _globalActivityDictionary = _viewManager.Get<Dictionary<int, GlobalActivityCountView>>();
                if (_globalActivityDictionary == null)
                {
                    _viewManager.Set<Dictionary<int, GlobalActivityCountView>>(new Dictionary<int, GlobalActivityCountView>());
                    _globalActivityDictionary = _viewManager.Get<Dictionary<int, GlobalActivityCountView>>();
                }
                _globalActivityDictionary.Clear();

                #endregion
                #region Initialize GlobalPeopleCountView dictionary

                _globalPeopleDictionary = _viewManager.Get<Dictionary<int, GlobalPeopleCountView>>();
                if (_globalPeopleDictionary == null)
                {
                    _viewManager.Set<Dictionary<int, GlobalPeopleCountView>>(new Dictionary<int, GlobalPeopleCountView>());
                    _globalPeopleDictionary = _viewManager.Get<Dictionary<int, GlobalPeopleCountView>>();
                }
                _globalPeopleDictionary.Clear();

                #endregion
                #region Load Establishments & Places to loop through

                var establishmentsWithPeopleWithActivities = _queries.Execute(new EstablishmentsWithPeopleWithActivities());
                var places = _entities.Query<Place>()
                    .EagerLoad(_entities, new Expression<Func<Place, object>>[]
                        {
                            x => x.GeoPlanetPlace,
                        })
                    .Where(p => p.IsCountry || p.IsEarth
                        //|| p.IsWater
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 28289409) // Antarctica
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959675) // Indian Ocean
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959676) // Southern Ocean
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959686) // Gulf of Mexico
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959687) // Caribbean Sea
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959707) // Arctic Ocean
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959709) // Atlantic Ocean
                        || (p.GeoPlanetPlace != null && p.GeoPlanetPlace.WoeId == 55959717) // Pacific Ocean
                        || p.OfficialName == "South Pacific Ocean"
                    ).ToArray(); // only hit the db once for these

                #endregion
                #region Loop through Establishments

                foreach (var establishmentId in establishmentsWithPeopleWithActivities.Select(x => x.RevisionId))
                {
                    #region Load EmployeeModuleSettings & create date range comparison values

                    var settings = GetEmployeeModuleSettings(establishmentId);

                    var toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                    var fromDateUtc = settings != null && settings.ReportsDefaultYearRange.HasValue
                        ? toDateUtc.AddYears(0 - settings.ReportsDefaultYearRange.Value - 1)
                        : new DateTime(DateTime.MinValue.Year, 1, 1);

                    #endregion
                    #region Initialize new GlobalActivityCountView

                    var activityStats = new GlobalActivityCountView
                    {
                        EstablishmentId = establishmentId,
                        TypeCounts = new Collection<ActivityViewStats.TypeCount>(),
                        PlaceCounts = new Collection<ActivityViewStats.PlaceCount>(),
                    };

                    #endregion
                    #region Initialize new GlobalPeopleCountView

                    var peopleStats = new GlobalPeopleCountView
                    {
                        EstablishmentId = establishmentId,
                        TypeCounts = new Collection<ActivityViewStats.TypeCount>(),
                        PlaceCounts = new Collection<ActivityViewStats.PlaceCount>(),
                        Count = _queries.Execute(new PeopleWithActivitiesCountByEstablishmentId(
                            establishmentId, fromDateUtc, toDateUtc))
                    };

                    #endregion
                    #region Loop through Places

                    foreach (var place in places)
                    {
                        #region Count Activities in this Place for this Establishment

                        var activityCount = _queries.Execute(new ActivityCountByPlaceIdsEstablishmentId(
                            new[] { place.RevisionId }, establishmentId, fromDateUtc, toDateUtc,
                            noUndated: false, /* include undated */ includeFuture: true /* include future */
                        ));

                        // add a placecount item to the view
                        activityStats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = activityCount,
                        });

                        // update the total activity count for the view
                        activityStats.Count += activityCount;

                        // update the place count in the view
                        if (activityCount > 0) ++activityStats.CountOfPlaces;

                        #endregion
                        #region Count People in this Place for this Establishment

                        var peopleCount = _queries.Execute(new PeopleWithActivitiesCountByPlaceIdsEstablishmentId(
                            new[] { place.RevisionId }, establishmentId, fromDateUtc, toDateUtc,
                            noUndated: false, /* include undated */ includeFuture: true /* include future */
                        ));

                        peopleStats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = peopleCount
                        });

                        if (peopleCount > 0) ++peopleStats.CountOfPlaces;

                        #endregion
                        #region Loop through EmployeeModuleSettings.ActivityTypes

                        if (settings == null || !settings.ActivityTypes.Any()) continue;

                        foreach (var type in settings.ActivityTypes)
                        {
                            var placeTypeCount = _queries.Execute(new ActivityCountByTypeIdPlaceIdsEstablishmentId(
                                type.Id, new[] { place.RevisionId }, establishmentId, fromDateUtc, toDateUtc,
                                noUndated: false, /* include undated */ includeFuture: true /* include future */
                            ));

                            var typeCount = activityStats.TypeCounts.SingleOrDefault(t => t.TypeId == type.Id);

                            if (typeCount != null) typeCount.Count += placeTypeCount;

                            else activityStats.TypeCounts.Add(new ActivityViewStats.TypeCount
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = placeTypeCount
                            });
                        }

                        #endregion
                    }

                    #endregion
                    #region Loop through EmployeeModuleSettings.ActivityTypes

                    if (settings != null && settings.ActivityTypes.Any())
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            var globalTypeCount = _queries.Execute(new PeopleWithActivitiesCountByTypeIdEstablishmentId(
                                type.Id, establishmentId, fromDateUtc, toDateUtc,
                                noUndated: false, /* include undated */ includeFuture: true /* include future */
                            ));

                            var typeCount = peopleStats.TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);

                            if (typeCount != null) typeCount.Count += globalTypeCount;

                            else peopleStats.TypeCounts.Add(new ActivityViewStats.TypeCount
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = globalTypeCount
                            });
                        }
                    }

                    #endregion

                    _globalActivityDictionary[establishmentId] = activityStats;
                    _globalPeopleDictionary[establishmentId] = peopleStats;
                }

                #endregion

                _viewManager.Set<Dictionary<int, GlobalActivityCountView>>(_globalActivityDictionary);
                _viewManager.Set<Dictionary<int, GlobalPeopleCountView>>(_globalPeopleDictionary);
            }
            catch (Exception ex)
            {
                _exceptionLogger.Log(ex);
                WriteOutput("A '{0}' exception was thrown while trying to build activity & people statistical / summary views.", ex.GetType().Name);
            }
            finally
            {
                StatsRwlock.ExitWriteLock();
                WriteOutput("Activity & people statistical / summary build views completed on {0} (UTC).", DateTime.UtcNow);
            }

            #endregion

            buildTimer.Stop();
            WriteOutput("ActivityViewProjector.BuildViews completed in {0} minutes.", buildTimer.Elapsed.TotalMinutes);
        }

        /*
         * Each call to BeginReadView() must be matched with EndReadView().
         * This method may return null.
         */
        public ICollection<ActivityView> BeginReadView()
        {
            Rwlock.EnterReadLock();

            /* This may return null if the ApplicationStarted view has not completed building. */
            var view = _viewManager.Get<ICollection<ActivityView>>();

#if DEBUG
            if (view == null)
            {
                WriteOutput(DateTime.Now + " >>> ActivityView is NULL <<<");
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

        private readonly IDictionary<int, EmployeeModuleSettings> _emsByEstablishmentId = new Dictionary<int, EmployeeModuleSettings>();
        private EmployeeModuleSettings GetEmployeeModuleSettings(int establishmentId)
        {
            if (!_emsByEstablishmentId.ContainsKey(establishmentId))
            {
                var ems = _queries.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));
                _emsByEstablishmentId.Add(establishmentId, ems);
            }
            return _emsByEstablishmentId[establishmentId];
        }

        private static void WriteOutput(string format, params object[] args)
        {
#if !DEBUG
            Trace.TraceInformation(format, args);
#else
            Debug.WriteLine(format, args);
#endif
        }

        private long _millisecondsSinceLast;
        private long MillisecondsSinceLast(Stopwatch timer)
        {
            var elapsed = timer.ElapsedMilliseconds;
            var value = elapsed - _millisecondsSinceLast;
            _millisecondsSinceLast = elapsed;
            return value;
        }

        #region Deprecated code

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
                        CreateOutput(DateTime.Now + " ActivityView update activity complete with " + view.Count + " activities.");
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
                    CreateOutput(DateTime.Now + " ActivityView delete activity complete with " + view.Count + " activities.");
                }
            }
        }
#endif

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

        #endregion
    }
}
