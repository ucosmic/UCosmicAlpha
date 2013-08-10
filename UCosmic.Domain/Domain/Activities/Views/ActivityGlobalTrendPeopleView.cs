using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    class ActivityGlobalTrendPeopleView
    {
        public class YearCount
        {
            public int Year { get; set; }
            public int Count { get; set; }
        }

        public ICollection<YearCount> Data { get; set; }

        public ActivityGlobalTrendPeopleView( IProcessQueries queryProcessor,
                                              IQueryEntities entities,
                                              int establishmentId,
                                              int placeId )
        {
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
                        Count = queryProcessor.Execute(new PeopleCountByPlaceIdEstablishmentId(placeId, establishmentId,
                                                                                               new DateTime(year, 1, 1),
                                                                                               new DateTime(year + 1, 1, 1)))
                    };

                    Data.Add(yearCount);
                }
            }
        }
    }
}
