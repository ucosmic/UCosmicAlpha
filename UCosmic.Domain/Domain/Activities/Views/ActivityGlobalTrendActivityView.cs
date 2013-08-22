using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class ActivityGlobalTrendActivityView
    {
        public class YearCount
        {
            public int Year { get; set; }
            public int Count { get; set; }
        }

        public int EstablishmentId { get; private set; }
        public ICollection<YearCount> Data { get; private set; }

        public ActivityGlobalTrendActivityView(IProcessQueries queryProcessor, int establishmentId)
        {
            EstablishmentId = establishmentId;
            Data = new Collection<YearCount>();

            var settings = queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId));

            DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
            DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
                                       ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                       : new DateTime(DateTime.MinValue.Year, 1, 1);


            for (int year = fromDateUtc.Year; year < toDateUtc.Year; year += 1 )
            {
                var yearCount = new YearCount
                {
                    Year = year,
                    Count = queryProcessor.Execute(new ActivityCountByEstablishmentId(establishmentId,
                                                                                      new DateTime(fromDateUtc.Year, 1, 1),
                                                                                      new DateTime(year + 1, 1, 1),
                                                                                      true /* No Undated Activities */,
                                                                                      (year == toDateUtc.Year-1) /* Include future in last year */ ))
                };

                Data.Add(yearCount);
            }
        }
    }
}
