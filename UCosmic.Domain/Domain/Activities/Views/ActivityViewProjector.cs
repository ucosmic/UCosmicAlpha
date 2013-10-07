using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Activities
{
    public class ActivityViewProjector //: IHandleEvents<ApplicationStarted>
    //,IHandleEvents<ActivityCreated>
    //,IHandleEvents<ActivityChanged>
    //,IHandleEvents<ActivityDeleted>
    //,IHandleEvents<EstablishmentChanged>
    //,IHandleEvents<AffiliationChanged>
    {
        //private static readonly ReaderWriterLockSlim Rwlock = new ReaderWriterLockSlim();
        //private static readonly ReaderWriterLockSlim StatsRwlock = new ReaderWriterLockSlim();
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queries;
        private readonly IManageViews _viewManager;
        private readonly ILogExceptions _exceptionLogger;

        private GlobalActivityCountViews _globalActivityDictionary = new GlobalActivityCountViews();
        private GlobalPeopleCountViews _globalPeopleDictionary = new GlobalPeopleCountViews();

        public ActivityViewProjector(IQueryEntities entities, IProcessQueries queries, IManageViews viewManager, ILogExceptions exceptionLogger)
        {
            _entities = entities;
            _queries = queries;
            _viewManager = viewManager;
            _exceptionLogger = exceptionLogger;
        }

        internal void BuildViews()
        {
            var buildTimer = new Stopwatch();
            buildTimer.Start();

            #region Build ActivityViews

            var view = new List<ActivityView>();
            //Rwlock.EnterWriteLock();

            try
            {
                var activityViewEntities = _entities.Query<Activity>()
                    //.EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                    //{
                    //    // load everything needed by the activityview constructor
                    //    x => x.Values.Select(y => y.Locations),
                    //    x => x.Values.Select(y => y.Types),
                    //    x => x.Person.Affiliations.Select(y => y.Establishment.Ancestors),
                    //})
                    // filter out non-public & edit-sourced activities before executing query
                    .Published()
                    .ToArray() // execute query
                ;
                view.AddRange(activityViewEntities.Select(x => new ActivityView(x)));
                _viewManager.Set<ActivityViews>(view);
            }
            catch (Exception ex)
            {
                _exceptionLogger.Log(ex);
                WriteOutput("A '{0}' exception was thrown while trying to build activity views.", ex.GetType().Name);
            }
            finally
            {
                //Rwlock.ExitWriteLock();
                WriteOutput("ActivityView build completed in {0} milliseconds with {1} activities.", MillisecondsSinceLast(buildTimer), view.Count);
            }

            #endregion
            #region Build GlobalActivityCountViews & GlobalPeopleCountViews

            //StatsRwlock.EnterWriteLock();

            try
            {
                #region Initialize GlobalActivityCountView dictionary

                _globalActivityDictionary = _viewManager.Get<GlobalActivityCountViews>();
                if (_globalActivityDictionary == null)
                {
                    _viewManager.Set<GlobalActivityCountViews>(new GlobalActivityCountViews());
                    _globalActivityDictionary = _viewManager.Get<GlobalActivityCountViews>();
                }
                _globalActivityDictionary.Clear();

                #endregion
                #region Initialize GlobalPeopleCountView dictionary

                _globalPeopleDictionary = _viewManager.Get<GlobalPeopleCountViews>();
                if (_globalPeopleDictionary == null)
                {
                    _viewManager.Set<GlobalPeopleCountViews>(new GlobalPeopleCountViews());
                    _globalPeopleDictionary = _viewManager.Get<GlobalPeopleCountViews>();
                }
                _globalPeopleDictionary.Clear();

                #endregion
                #region Loop through Establishments

                var establishmentsWithPeopleWithActivities = _queries.Execute(new EstablishmentsWithPeopleWithActivities { IsPublished = true });
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

                    // count total activities
                    var allActivities = _entities.Query<Activity>()
                        .Published()
                        .AffiliatedWith(establishmentId)
                        .InDateRange(fromDateUtc, toDateUtc)
                        //.EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                        //{
                        //    x => x.Person.Affiliations.Select(y => y.Establishment.Ancestors),
                        //    x => x.Values.Select(y => y.Locations.Select(z => z.Place.Ancestors)),
                        //    x => x.Values.Select(y => y.Locations.Select(z => z.Place.Ancestors)),
                        //})
                        .ToArray()
                        .AsQueryable()
                    ;
                    var activityStats = new GlobalActivityCountView
                    {
                        EstablishmentId = establishmentId,
                        TypeCounts = new Collection<ActivityViewStats.TypeCount>(),
                        PlaceCounts = new Collection<ActivityViewStats.PlaceCount>(),
                        Count = allActivities.Distinct().Count(),
                    };

                    #endregion
                    #region Initialize new GlobalPeopleCountView

                    var peopleStats = new GlobalPeopleCountView
                    {
                        EstablishmentId = establishmentId,
                        TypeCounts = new Collection<ActivityViewStats.TypeCount>(),
                        PlaceCounts = new Collection<ActivityViewStats.PlaceCount>(),
                        Count = allActivities.Select(x => x.Person).Distinct().Count(),
                    };

                    #endregion
                    #region Loop through Places

                    //foreach (var place in places)
                    var allActivityPlaces = allActivities.Places()
                        .Where(p => p.IsCountry
                            //|| p.IsEarth // skews the google chart (aka heatmap) gradient scale
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
                        ).ToArray();
                    foreach (var place in allActivityPlaces)
                    {
                        #region Count Activities in this Place for this Establishment

                        var activityCount = allActivities.WithPlace(place.RevisionId).Count();

                        // add a placecount item to the view
                        activityStats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = activityCount,
                        });

                        // update the place count in the view
                        if (activityCount > 0) ++activityStats.CountOfPlaces;

                        #endregion
                        #region Count People in this Place for this Establishment

                        var peopleCount = allActivities.WithPlace(place.RevisionId).Select(x => x.Person).Distinct().Count();

                        peopleStats.PlaceCounts.Add(new ActivityViewStats.PlaceCount
                        {
                            PlaceId = place.RevisionId,
                            CountryCode = place.IsCountry ? place.GeoPlanetPlace.Country.Code : null,
                            OfficialName = place.OfficialName,
                            Count = peopleCount
                        });

                        if (peopleCount > 0) ++peopleStats.CountOfPlaces;

                        #endregion
                    }

                    #endregion
                    #region Loop through EmployeeModuleSettings.ActivityTypes

                    if (settings != null && settings.ActivityTypes.Any())
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            var globalActivityTypeCount = allActivities.WithActivityType(type.Id).Count();
                            var activitiesTypeCount = activityStats.TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);

                            if (activitiesTypeCount != null) activitiesTypeCount.Count += globalActivityTypeCount;
                            else activityStats.TypeCounts.Add(new ActivityViewStats.TypeCount
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = globalActivityTypeCount,
                                Rank = type.Rank,
                            });

                            var globalPeopleTypeCount = allActivities.WithActivityType(type.Id).Select(x => x.Person).Distinct().Count();
                            var peopleTypeCount = peopleStats.TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);

                            if (peopleTypeCount != null) peopleTypeCount.Count += globalPeopleTypeCount;
                            else peopleStats.TypeCounts.Add(new ActivityViewStats.TypeCount
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = globalPeopleTypeCount,
                                Rank = type.Rank,
                            });
                        }
                    }

                    activityStats.TypeCounts = activityStats.TypeCounts.OrderBy(x => x.Rank).ToArray();
                    peopleStats.TypeCounts = peopleStats.TypeCounts.OrderBy(x => x.Rank).ToArray();

                    #endregion

                    _globalActivityDictionary[establishmentId] = activityStats;
                    _globalPeopleDictionary[establishmentId] = peopleStats;
                }

                #endregion

                _viewManager.Set<GlobalActivityCountViews>(_globalActivityDictionary);
                _viewManager.Set<GlobalPeopleCountViews>(_globalPeopleDictionary);
            }
            catch (Exception ex)
            {
                _exceptionLogger.Log(ex);
                WriteOutput("A '{0}' exception was thrown while trying to build activity & people statistical / summary views.", ex.GetType().Name);
            }
            finally
            {
                //StatsRwlock.ExitWriteLock();
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
        public ActivityViews BeginReadView()
        {
            //Rwlock.EnterReadLock();

            /* This may return null if the ApplicationStarted view has not completed building. */
            var view = _viewManager.Get<ActivityViews>();

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
            //Rwlock.ExitReadLock();
        }

        public GlobalActivityCountView BeginReadActivityCountsView(int establishmentId)
        {
            //StatsRwlock.EnterReadLock();
            if (_globalActivityDictionary.Count == 0)
            {
                _globalActivityDictionary = _viewManager.Get<GlobalActivityCountViews>() ?? new GlobalActivityCountViews();
            }
            return _globalActivityDictionary.Values.SingleOrDefault(v => v.EstablishmentId == establishmentId);
        }

        public void EndReadActivityCountsView()
        {
            //StatsRwlock.ExitReadLock();
        }

        public GlobalPeopleCountView BeginReadPeopleCountsView(int establishmentId)
        {
            //StatsRwlock.EnterReadLock();
            if (_globalPeopleDictionary.Count == 0)
            {
                _globalPeopleDictionary = _viewManager.Get<GlobalPeopleCountViews>() ?? new GlobalPeopleCountViews();
            }
            return _globalPeopleDictionary.Values.SingleOrDefault(v => v.EstablishmentId == establishmentId);
        }

        public void EndReadPeopleCountsView()
        {
            //StatsRwlock.ExitReadLock();
        }

        //public void Handle(ApplicationStarted @event)
        //{
        //    BuildViews();
        //}

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
                var view = _viewManager.Get<ActivityViews>();
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

                            _viewManager.Set<ActivityViews>(view);
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
            var view = _viewManager.Get<ActivityViews>();
            if (view != null) // if null, could signify that ApplicationStarted build is not yet complete.
            {
                Rwlock.EnterWriteLock();

                try
                {
                    var activityView = view.SingleOrDefault(a => a.Id == activityId);
                    if (activityView != null)
                    {
                        view.Remove(activityView);

                        _viewManager.Set<ActivityViews>(view);
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
