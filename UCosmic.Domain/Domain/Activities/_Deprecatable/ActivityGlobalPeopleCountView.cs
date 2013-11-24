//using System;
//using System.Collections.Generic;
//using System.Collections.ObjectModel;
//using System.Linq;
//using UCosmic.Domain.Employees;
//using UCosmic.Domain.People;
//using UCosmic.Domain.Places;

//namespace UCosmic.Domain.Activities
//{
//    public class ActivityGlobalPeopleCountView
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
//        public int Count { get; private set; }                            // Global count of people
//        public int CountOfPlaces { get; private set; }                      // Total places with activity/people
//        public ICollection<TypeCount> TypeCounts { get; private set; }    // Global count of types
//        public ICollection<PlaceCount> PlaceCounts { get; private set; }    // Count of activities/people per place

//        public ActivityGlobalPeopleCountView( IProcessQueries queryProcessor,
//                                              IQueryEntities entities,
//                                              int establishmentId)
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
//            Count = queryProcessor.Execute(new PeopleWithActivitiesCountByEstablishmentId(establishmentId,
//                                                                            fromDateUtc,
//                                                                            toDateUtc));

//            IEnumerable<Place> places = entities.Query<Place>().Where(p => p.IsCountry || p.IsWater || p.IsEarth);
//            foreach (var place in places)
//            {
//                int peopleCount =
//                    queryProcessor.Execute(new PeopleWithActivitiesCountByPlaceIdsEstablishmentId(new int[] { place.RevisionId },
//                                                                                                 establishmentId,
//                                                                                                 fromDateUtc,
//                                                                                                 toDateUtc,
//                                                                                                 false, /* include undated */
//                                                                                                 true /* include future */));

//                PlaceCounts.Add(new PlaceCount
//                {
//                    PlaceId = place.RevisionId,
//                    OfficialName = place.OfficialName,
//                    Count = peopleCount
//                });

//                if (peopleCount > 0)
//                {
//                    CountOfPlaces += 1;
//                }
//            }

//            if ((settings != null) && settings.ActivityTypes.Any())
//            {
//                foreach (var type in settings.ActivityTypes)
//                {
//                    int globalTypeCount = queryProcessor.Execute(
//                        new PeopleWithActivitiesCountByTypeIdEstablishmentId(type.Id,
//                                                                             establishmentId,
//                                                                             fromDateUtc,
//                                                                             toDateUtc,
//                                                                             false, /* include undated */
//                                                                             true /* include future */));

//                    var typeCount = TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);
//                    if (typeCount != null)
//                    {
//                        typeCount.Count += globalTypeCount;
//                    }
//                    else
//                    {
//                        typeCount = new TypeCount
//                        {
//                            TypeId = type.Id,
//                            Type = type.Type,
//                            Count = globalTypeCount
//                        };

//                        TypeCounts.Add(typeCount);
//                    }
//                }
//            }
//        }
//    }
//}
