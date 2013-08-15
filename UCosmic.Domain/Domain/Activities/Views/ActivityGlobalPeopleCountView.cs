using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityGlobalPeopleCountView
    {
        public class TypeCount
        {
            public int TypeId { get; set; }
            public string Type { get; set; }
            public int Count { get; set; }
        }

        public int EstablishmentId { get; private set; }
        public int Count { get; private set; }                            // Global count of people
        public ICollection<TypeCount> TypeCounts { get; private set; }    // Global count of types

        public ActivityGlobalPeopleCountView( IProcessQueries queryProcessor,
                                              IQueryEntities entities,
                                              int establishmentId)
        {
            EstablishmentId = establishmentId;
            TypeCounts = new Collection<TypeCount>();

            var settings = queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
            DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                       : new DateTime(DateTime.MinValue.Year, 1, 1);

            Count = 0;

            IEnumerable<Place> places = entities.Query<Place>().Where(p => p.IsCountry || p.IsWater || p.IsEarth);
            foreach (var place in places)
            {
                Count += queryProcessor.Execute(new PeopleCountByPlaceIdEstablishmentId(place.RevisionId,
                                                                                        establishmentId,
                                                                                        fromDateUtc,
                                                                                        toDateUtc));

                if (settings.ActivityTypes.Any())
                {
                    foreach (var type in settings.ActivityTypes)
                    {
                        int placeTypeCount = queryProcessor.Execute(
                            new PeopleCountByTypeIdPlaceIdEstablishmentId(type.Id,
                                                                          place.RevisionId,
                                                                          establishmentId,
                                                                          fromDateUtc,
                                                                          toDateUtc));

                        var typeCount = TypeCounts.SingleOrDefault(c => c.TypeId == type.Id);
                        if (typeCount != null)
                        {
                            typeCount.Count += placeTypeCount;
                        }
                        else
                        {
                            typeCount = new TypeCount
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = placeTypeCount
                            };

                            TypeCounts.Add(typeCount);
                        }
                    }
                }
            }
        }
    }
}
