using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityPlaceActivityCountView
    {
        public class TypeCount
        {
            public int TypeId { get; set; }
            public string Type { get; set; }
            public int Count { get; set; }
        }

        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public int EstablishmentId { get; private set; }
        public int[] PlaceIds { get; private set; }
        public string OfficialName { get; private set; }
        public int Count { get; private set; }
        public ICollection<TypeCount> TypeCounts { get; private set; }

        public ActivityPlaceActivityCountView(IProcessQueries queryProcessor,
                                              IQueryEntities entities,
                                              int establishmentId,
                                              int[] placeIds)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            EstablishmentId = establishmentId;
            PlaceIds = placeIds;
            TypeCounts = new Collection<TypeCount>();

            var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
            DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                       : new DateTime(DateTime.MinValue.Year, 1, 1);

            /* Return place official name of 1st item only */
            {
                int placeId = placeIds[0];
                Place place = entities.Query<Place>().SingleOrDefault(p => p.RevisionId == placeId);
                if (place != null)
                {
                    OfficialName = place.OfficialName;
                }
            }

            Count = _queryProcessor.Execute(new ActivityCountByPlaceIdsEstablishmentId(PlaceIds,
                                                                                       establishmentId,
                                                                                       fromDateUtc,
                                                                                       toDateUtc,
                                                                                       false, /* no undated? */
                                                                                       true /* include future? */));

            if ((settings != null) && settings.ActivityTypes.Any())
            {
                foreach (var type in settings.ActivityTypes)
                {
                    int placeTypeCount = queryProcessor.Execute(
                        new ActivityCountByTypeIdPlaceIdsEstablishmentId(type.Id,
                                                                         PlaceIds,
                                                                         establishmentId,
                                                                         fromDateUtc,
                                                                         toDateUtc,
                                                                         false, /* no undated? */
                                                                         true /* include future? */));

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
