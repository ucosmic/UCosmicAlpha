#if DEBUG
using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class LoadPacificOceanToponyms : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformLoadPacificOceanToponymsWork : IPerformWork<LoadPacificOceanToponyms>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;

        public PerformLoadPacificOceanToponymsWork(IProcessQueries queryProcessor
            , IQueryEntities entities
            , ISendMail mailSender
            , ILogExceptions exceptionLogger
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(LoadPacificOceanToponyms job)
        {
            var reportBuilder = new WorkReportBuilder("Load Pacific Ocean Toponyms");
            try
            {
                var geoNameIds = new[] { 8411083, 2363254 };
                var pacifics = _entities.Query<GeoNamesToponym>().Where(x => geoNameIds.Contains(x.GeoNameId));
                reportBuilder.Report("Found {0} Pacific Ocean toponyms", pacifics.Count());
                if (pacifics.Count() < 2)
                {
                    reportBuilder.Report("Seeding Pacific Ocean toponyms.");

                    _queryProcessor.Execute(new SingleGeoNamesToponym(8411083));
                    _queryProcessor.Execute(new SingleGeoNamesToponym(2363254));

                    reportBuilder.Report("There is/are now {0} Pacific Ocean toponyms.", pacifics.Count());
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
