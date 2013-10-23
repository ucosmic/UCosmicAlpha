using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class ComposeRegions : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformComposeRegionsWork : IPerformWork<ComposeRegions>
    {
        private readonly ICommandEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;

        public PerformComposeRegionsWork(ICommandEntities entities
            , ISendMail mailSender
            , ILogExceptions exceptionLogger
        )
        {
            _entities = entities;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(ComposeRegions job)
        {
            var reportBuilder = new WorkReportBuilder("Compose Regions");
            try
            {
                var regions = _entities.Get<Place>()
                    .Where(x => x.IsRegion && !x.IsWater && !x.Components.Any());

                reportBuilder.Report("There is/are {0} uncomposed region(s).", regions.Count());

                if (regions.Any())
                {
                    var mutated = false;
                    var regionsArray = regions.ToArray();
                    foreach (var region in regionsArray)
                    {
                        reportBuilder.Report("");
                        reportBuilder.Report("Composing '{0}'...", region.OfficialName);

                        //if (!region.IsRegion) continue;
                        var woeId = region.GeoPlanetPlace.WoeId;
                        var components = _entities.Get<Place>()
                            .Where(x => x.GeoPlanetPlace != null
                                && x.GeoPlanetPlace.BelongTos.Select(y => y.BelongToWoeId).Contains(woeId));
                        foreach (var component in components)
                        {
                            if (!component.IsCountry && !component.IsWater) continue;
                            if (component.IsRegion) continue;
                            reportBuilder.Report("    Component: '{0}'", component.OfficialName);
                            if (region.Components.All(x => x.RevisionId != component.RevisionId))
                            {
                                region.Components.Add(component);
                                if (!mutated) mutated = true;
                            }
                        }
                    }
                    if (mutated) _entities.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                reportBuilder.Report("");
                reportBuilder.Report("JOB FAILED!");
                reportBuilder.Report(ex.GetType().Name);
                reportBuilder.Report(ex.Message);
                reportBuilder.Report(ex.StackTrace);
                _exceptionLogger.Log(ex);
            }
            finally
            {
                reportBuilder.Send(_mailSender);
            }
        }
    }
}
