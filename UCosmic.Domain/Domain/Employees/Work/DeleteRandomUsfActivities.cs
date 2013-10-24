#if DEBUG
using System;
using System.Diagnostics;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.Employees
{
    public class DeleteRandomUsfActivities : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformDeleteRandomUsfActivitiesWork : IPerformWork<DeleteRandomUsfActivities>
    {
        private readonly ICommandEntities _entities;

        public PerformDeleteRandomUsfActivitiesWork(ICommandEntities entities)
        {
            _entities = entities;
        }

        private static readonly int[] IdsToKeep = new[] { 2434, 2672, 2477, 2475, 3016, 2463, 2487, 2734, 2513, 2651,2515, 2524,
            2526, 2720, 2634, 2748, 1718, 1724, 1748, 2636, 2986, 2984, 2988, 3014, 2655, 2670, 2684, 2691, 2587, 2720, 2748 };

        public void Perform(DeleteRandomUsfActivities job)
        {
            var stopwatch = new Stopwatch();

            var draftText = ActivityMode.Draft.AsSentenceFragment(); // delete drafts and work copies
            var activities = _entities.Get<Activity>().Where(x => x.ModeText == draftText || x.Original != null);
            foreach (var activity in activities)  _entities.Purge(activity);
            _entities.SaveChanges();

            activities = _entities.Get<Activity>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == 3306))
            ;

            var random = new Random();
            while (activities.Count() > 250)
            {
                var total = activities.Count();
                var idToDelete = random.Next(activities.Min(x => x.RevisionId), activities.Max(x => x.RevisionId));
                if (!IdsToKeep.Contains(idToDelete))
                {
                    var activityToDelete = _entities.Get<Activity>().ById(idToDelete);
                    if (activityToDelete != null)
                    {
                        _entities.Purge(activityToDelete);
                        _entities.SaveChanges();
                    }
                }

                if (stopwatch.Elapsed.TotalMinutes > 1) break;
            }
        }
    }
}
#endif