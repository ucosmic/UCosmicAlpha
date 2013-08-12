using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityGlobalActivityCountView
    {
        public class TypeCount
        {
            public int TypeId { get; set; }
            public string Type { get; set; }
            public int Count { get; set; }
        }

        public int EstablishmentId { get; private set; }
        public int PlaceCount { get; private set; }               // Total places with activity/people
        public int Count { get; private set; }                    // Global count of activities
        public ICollection<TypeCount> TypeCounts { get; set; }    // Global count of types

        public ActivityGlobalActivityCountView(IProcessQueries queryProcessor,
                                               IQueryEntities entities,
                                               int establishmentId )
        {
            EstablishmentId = establishmentId;
            TypeCounts = new Collection<TypeCount>();

            var settings = queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
            DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                       : new DateTime(DateTime.MinValue.Year, 1, 1);

            PlaceCount = 0;
            Count = 0;

            IEnumerable<Place> places = entities.Query<Place>().Where(p => p.IsCountry || p.IsWater || p.IsEarth);
            foreach (var place in places)
            {
                int placeCount = queryProcessor.Execute(new ActivityCountByPlaceIdEstablishmentId( place.RevisionId,
                                                                                                   establishmentId,
                                                                                                   fromDateUtc,
                                                                                                   toDateUtc ));

                Count += placeCount;

                if (placeCount > 0)
                {
                    PlaceCount += 1;
                }

                if (settings.ActivityTypes.Any())
                {
                    foreach (var type in settings.ActivityTypes)
                    {
                        var typeCount = new TypeCount
                        {
                            TypeId = type.Id,
                            Type = type.Type,
                            Count = queryProcessor.Execute(
                                new ActivityCountByTypeIdPlaceIdEstablishmentId( type.Id,
                                                                                 place.RevisionId,
                                                                                 establishmentId,
                                                                                 fromDateUtc,
                                                                                 toDateUtc ))
                        };

                        TypeCounts.Add(typeCount);
                    }
                }
            }
        }
    }
}
