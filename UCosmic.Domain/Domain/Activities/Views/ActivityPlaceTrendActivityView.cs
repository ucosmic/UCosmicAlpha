using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    class ActivityTrendActivityView
    {
        public class YearCount
        {
            public int Year { get; set; }
            public int Count { get; set; }
        }

        public int EstablishmentId { get; private set; }
        public ICollection<YearCount> Data { get; private set; }

        public ActivityTrendActivityView( IProcessQueries queryProcessor,
                                          IQueryEntities entities,
                                          int establishmentId,
                                          int placeId )
        {
            EstablishmentId = establishmentId;
            Data = new Collection<YearCount>();

            var settings = queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
            DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                       : new DateTime(DateTime.MinValue.Year, 1, 1);

            Place place = entities.Query<Place>().SingleOrDefault(p => p.RevisionId == placeId);
            if (place != null)
            {
                for (int year = fromDateUtc.Year; year < toDateUtc.Year; year += 1)
                {
                    var yearCount = new YearCount
                    {
                        Year = year,
                        Count = queryProcessor.Execute(new ActivityCountByPlaceIdEstablishmentId(placeId,
                                                                                                 establishmentId,
                                                                                                 new DateTime(year, 1, 1),
                                                                                                 new DateTime(year + 1, 1, 1)))
                    };

                    Data.Add(yearCount);
                }
            }
        }
    }
}
