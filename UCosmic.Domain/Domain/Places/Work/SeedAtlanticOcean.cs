#if false
using System;
using System.Linq;
using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;

namespace UCosmic.Domain.Places
{
    public class SeedAtlanticOcean : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformSeedAtlanticOceanWork : IPerformWork<SeedAtlanticOcean>
    {
        private const string AtlanticOceanText = "Atlantic Ocean";

        private readonly IProcessQueries _queryProcessor;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;
        private readonly IContainGeoPlanet _geoPlanet;
        private readonly IContainGeoNames _geoNames;

        public PerformSeedAtlanticOceanWork(IProcessQueries queryProcessor
            , ISendMail mailSender
            , ILogExceptions exceptionLogger
            , IContainGeoPlanet geoPlanet
            , IContainGeoNames geoNames
        )
        {
            _queryProcessor = queryProcessor;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
            _geoPlanet = geoPlanet;
            _geoNames = geoNames;
        }

        public void Perform(SeedAtlanticOcean job)
        {
            var reportBuilder = new WorkReportBuilder("Seed Atlantic Ocean");
            try
            {
                var atlantics = _queryProcessor.Execute(new PlacesWithName
                {
                    MaxResults = 5,
                    Term = AtlanticOceanText,
                    TermMatchStrategy = StringMatchStrategy.Equals,
                });
                if (atlantics.Any())
                {
                    reportBuilder.Report("At least {0} Place(s) named '{1}' already exist(s).", atlantics.Count(), AtlanticOceanText);
                }
                else
                {
                    reportBuilder.Report("There are no Places named '{0}'.", AtlanticOceanText);
                    reportBuilder.Report("Seeding '{0}'.", AtlanticOceanText);

                    var geoPlanetPlaces = _geoPlanet.Places(AtlanticOceanText);
                    var geoPlanetToponyms = _geoNames.Search(new SearchOptions(SearchType.NameEquals, AtlanticOceanText));

                    var geoNamesToponym = geoPlanetToponyms.FirstOrDefault(x => x.FeatureClassCode == "H");
                    var geoPlanetPlace = geoPlanetPlaces.FirstOrDefault(x => x.Type.Code == 37 || x.Type.Code == 38);

                    if (geoPlanetPlace != null && geoNamesToponym != null)
                        _queryProcessor.Execute(new PlaceByWoeId(geoPlanetPlace.WoeId, geoNamesToponym.GeoNameId));

                    reportBuilder.Report("There is/are now {0} Place(s) named '{1}'.", atlantics.Count(), AtlanticOceanText);
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
#endif