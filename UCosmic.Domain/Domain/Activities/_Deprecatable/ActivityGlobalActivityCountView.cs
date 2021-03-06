﻿//using System;
//using System.Collections.Generic;
//using System.Collections.ObjectModel;
//using System.Linq;
//using UCosmic.Domain.Employees;
//using UCosmic.Domain.Places;

//namespace UCosmic.Domain.Activities
//{
//    public class ActivityGlobalActivityCountView
//    {
//        public class TypeCount
//        {
//            public int TypeId { get; set; }
//            public string Type { get; set; }
//            public int Count { get; set; }
//        }

//        public class PlaceCount
//        {
//            public int PlaceId { get; set; }
//            public string OfficialName { get; set; }
//            public int Count { get; set; }
//        }

//        public int EstablishmentId { get; private set; }
//        public int CountOfPlaces { get; private set; }              // Total places with activity/people
//        public int Count { get; private set; }                      // Global count of activities
//        public ICollection<TypeCount> TypeCounts { get; private set; }      // Global count of types
//        public ICollection<PlaceCount> PlaceCounts { get; private set; }    // Count of activities/people per place

//        public ActivityGlobalActivityCountView()
//        {
//        }

//        public ActivityGlobalActivityCountView(IProcessQueries queryProcessor,
//                                               IQueryEntities entities,
//                                               int establishmentId )
//        {
//            EstablishmentId = establishmentId;
//            TypeCounts = new Collection<TypeCount>();
//            PlaceCounts = new Collection<PlaceCount>();

//            var settings = queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

//            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
//            DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
//                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
//                                       : new DateTime(DateTime.MinValue.Year, 1, 1);

//            CountOfPlaces = 0;
//            Count = 0;

//            IEnumerable<Place> places = entities.Query<Place>().Where(p => p.IsCountry || p.IsWater || p.IsEarth);
//            foreach (var place in places)
//            {
//                int activityCount = queryProcessor.Execute(new ActivityCountByPlaceIdsEstablishmentId(new int[] { place.RevisionId },
//                                                                                                      establishmentId,
//                                                                                                      fromDateUtc,
//                                                                                                      toDateUtc,
//                                                                                                      false, /* no undated? */
//                                                                                                      true /* include future? */));

//                PlaceCounts.Add(new PlaceCount
//                {
//                    PlaceId = place.RevisionId,
//                    OfficialName = place.OfficialName,
//                    Count = activityCount
//                });

//                Count += activityCount;

//                if (activityCount > 0)
//                {
//                    CountOfPlaces += 1;
//                }

//                if ((settings != null) && settings.ActivityTypes.Any())
//                {
//                    foreach (var type in settings.ActivityTypes)
//                    {
//                        int placeTypeCount = queryProcessor.Execute(
//                            new ActivityCountByTypeIdPlaceIdsEstablishmentId(type.Id,
//                                                                            new int[] { place.RevisionId },
//                                                                            establishmentId,
//                                                                            fromDateUtc,
//                                                                            toDateUtc,
//                                                                            false, /* no undated? */
//                                                                            true /* include future? */));

//                        var typeCount = TypeCounts.SingleOrDefault(t => t.TypeId == type.Id);
//                        if (typeCount != null)
//                        {
//                            typeCount.Count += placeTypeCount;
//                        }
//                        else
//                        {
//                            typeCount = new TypeCount
//                            {
//                                TypeId = type.Id,
//                                Type = type.Type,
//                                Count = placeTypeCount
//                            };

//                            TypeCounts.Add(typeCount);
//                        }
//                    }
//                }
//            }
//        }
//    }
//}
