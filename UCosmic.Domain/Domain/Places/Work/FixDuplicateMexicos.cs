#if DEBUG
using System;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Places
{
    public class FixDuplicateMexicos : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformFixDuplicateMexicosWork : IPerformWork<FixDuplicateMexicos>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;

        public PerformFixDuplicateMexicosWork(IProcessQueries queryProcessor
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

        public void Perform(FixDuplicateMexicos job)
        {
            var reportBuilder = new WorkReportBuilder("Fix Duplicate Mexicos");
            try
            {
                // one is country, other is Estado de Mexico
                var mexicos = _entities.Query<Place>()
                    .EagerLoad(_entities, new Expression<Func<Place, object>>[]
                    {
                        x => x.Ancestors.Select(y => y.Ancestor),
                        x => x.Offspring.Select(y => y.Offspring),
                        x => x.GeoPlanetPlace,
                        x => x.GeoNamesToponym,
                    })
                    .Where(x => x.OfficialName.Equals("Mexico", StringComparison.OrdinalIgnoreCase)).ToArray();
                var mexico1 = mexicos[0];
                var mexico2 = mexicos[1];
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