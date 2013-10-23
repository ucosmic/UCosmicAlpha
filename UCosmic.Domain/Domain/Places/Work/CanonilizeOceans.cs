#if false
using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class CanonilizeOceans : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformCanonilizeOceansWork : IPerformWork<CanonilizeOceans>
    {
        private const string AtlanticText = "Atlantic Ocean";
        private const string SouthAtlanticText = "South Atlantic Ocean";
        private const string NorthAtlanticText = "North Atlantic Ocean";
        private const string PacificText = "Pacific Ocean";
        private const string SouthPacificText = "South Pacific Ocean";
        private const string NorthPacificText = "North Pacific Ocean";

        private readonly IQueryEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly ILogExceptions _exceptionLogger;
        private readonly IHandleCommands<UpdatePlace> _updatePlace;

        public PerformCanonilizeOceansWork(IQueryEntities entities
            , ISendMail mailSender
            , ILogExceptions exceptionLogger
            , IHandleCommands<UpdatePlace> updatePlace
        )
        {
            _entities = entities;
            _mailSender = mailSender;
            _exceptionLogger = exceptionLogger;
            _updatePlace = updatePlace;
        }

        public void Perform(CanonilizeOceans job)
        {
            var reportBuilder = new WorkReportBuilder("Canonilize Oceans");
            try
            {
                var atlantic = _entities.Query<Place>().Single(x => x.OfficialName == AtlanticText);
                var subAtlantics = _entities.Query<Place>()
                    .Where(x => x.OfficialName == SouthAtlanticText || x.OfficialName == NorthAtlanticText)
                    .Where(x => x.ParentId != atlantic.RevisionId);

                reportBuilder.Report("There is/are {0} sub-atlantic oceans that do not have atlantic for a parent.", subAtlantics.Count());

                if (subAtlantics.Any())
                {
                    reportBuilder.Report("Canonilizing sub-atlantics.");
                    var subAtlanticsArray = subAtlantics.ToArray();
                    foreach (var subAtlantic in subAtlanticsArray)
                        _updatePlace.Handle(new UpdatePlace(subAtlantic.RevisionId, atlantic.RevisionId));
                    reportBuilder.Report("There is/are now {0} sub-atlantic oceans that do not have atlantic for a parent.", subAtlantics.Count());
                    reportBuilder.Report("");
                }

                var pacific = _entities.Query<Place>().Single(x => x.OfficialName == PacificText);
                var subPacifics = _entities.Query<Place>()
                    .Where(x => x.OfficialName == SouthPacificText || x.OfficialName == NorthPacificText)
                    .Where(x => x.ParentId != pacific.RevisionId);

                reportBuilder.Report("There is/are {0} sub-pacific oceans that do not have pacific for a parent.", subPacifics.Count());

                if (subPacifics.Any())
                {
                    reportBuilder.Report("Canonilizing sub-pacifics.");
                    var subPacificsArray = subPacifics.ToArray();
                    foreach (var subPacific in subPacificsArray)
                        _updatePlace.Handle(new UpdatePlace(subPacific.RevisionId, pacific.RevisionId));
                    reportBuilder.Report("There is/are now {0} sub-pacific oceans that do not have pacific for a parent.", subPacifics.Count());
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