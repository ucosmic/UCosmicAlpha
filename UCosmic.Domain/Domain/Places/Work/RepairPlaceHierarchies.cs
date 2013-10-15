using System;
using System.Diagnostics;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class RepairPlaceHierarchies : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.FromDays(7); } }
    }

    public class PerformRepairPlaceHierarchiesWork : IPerformWork<RepairPlaceHierarchies>
    {
        private static readonly object Lock = new object();

        private readonly IQueryEntities _entities;
        private readonly ISendMail _mailSender;
        private readonly IHandleCommands<EnsurePlaceHierarchies> _placeNodes;
        private readonly ILogExceptions _exceptionLogger;

        public PerformRepairPlaceHierarchiesWork(IQueryEntities entities
            , ISendMail mailSender
            , IHandleCommands<EnsurePlaceHierarchies> placeNodes
            , ILogExceptions exceptionLogger
        )
        {
            _entities = entities;
            _mailSender = mailSender;
            _placeNodes = placeNodes;
            _exceptionLogger = exceptionLogger;
        }

        public void Perform(RepairPlaceHierarchies job)
        {
            lock (Lock)
            {
                var stopwatch = new Stopwatch();
                stopwatch.Start();
                var reportBuilder = new WorkReportBuilder("Repair Place Hierarchies");
                reportBuilder.Report("{0}ms: Checking for Places with invalid ancestral hierarchies.", stopwatch.ElapsedMilliseconds);
                try
                {
                    var brokenPlaces = _entities.Query<Place>()
                        .Where(x => x.Parent != null)
                        .Count(x => x.Ancestors.Count <= x.Parent.Ancestors.Count // place should always have more ancestors than its parent
                            || !x.Ancestors.Select(y => y.AncestorId).Contains(x.ParentId.Value) // place ancestors should always contain the parent
                            // place should have 1 more ancestor than its closest ancestor does
                            || x.Ancestors.Count != x.Ancestors.OrderBy(y => y.Separation).FirstOrDefault().Ancestor.Ancestors.Count + 1)
                    ;
                    if (brokenPlaces < 1)
                        reportBuilder.Report("{0}ms: No Places appear to have invalid ancestral hierarchies.", stopwatch.ElapsedMilliseconds);
                    else
                        reportBuilder.Report("{0}ms: A total of {1} Places appear to have invalid hierarchies.", stopwatch.ElapsedMilliseconds, brokenPlaces);
                    reportBuilder.Report("");

                    var command = new EnsurePlaceHierarchies();
                    _placeNodes.Handle(command);

                    reportBuilder.Report("{0}ms: Place ancestral hierarchy repair command ran.", stopwatch.ElapsedMilliseconds);
                    reportBuilder.Report("At total of {0} Places have had their ancestral hierarchies repaired.", command.EnsuredPlaceNames.Count);
                    foreach (var ensured in command.EnsuredPlaceNames)
                    {
                        reportBuilder.Report("{0} (PlaceId {1})", ensured.Value, ensured.Key);
                    }

                    reportBuilder.Report("");
                    reportBuilder.Report("Job completed in {0} minutes.", stopwatch.Elapsed.TotalMinutes);
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
}
