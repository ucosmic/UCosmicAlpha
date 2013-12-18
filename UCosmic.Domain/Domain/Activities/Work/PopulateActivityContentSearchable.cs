using System;
using System.Linq;
using UCosmic.Web.Mvc.Annotations;

namespace UCosmic.Domain.Activities
{
    [UsedImplicitly]
    public class PopulateActivityContentSearchable : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformPopulateActivityContentSearchableWork : IPerformWork<PopulateActivityContentSearchable>
    {
        private readonly ICommandEntities _entities;

        public PerformPopulateActivityContentSearchableWork(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Perform(PopulateActivityContentSearchable job)
        {
            var isChanged = false;
            var entities = _entities.Get<ActivityValues>();
            foreach (var entity in entities.Where(x => string.IsNullOrWhiteSpace(x.ContentSearchable) && !string.IsNullOrWhiteSpace(x.Content)))
            {
                entity.Content = entity.Content;
                isChanged = true;
            }
            if (isChanged) _entities.SaveChanges();
        }
    }
}
