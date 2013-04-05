using System;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class DraftMyActivity
    {
        public IPrincipal Principal { get; set; }
        public int Number { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ActivityCommandTag[] Tags { get; set; }
    }

    public class ActivityCommandTag
    {
        public string Text { get; set; }
        public ActivityTagDomainType DomainType { get; set; }
        public int? DomainKey { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class HandleDraftMyActivityCommand : IHandleCommands<DraftMyActivity>
    {
        private readonly ICommandEntities _entities;

        public HandleDraftMyActivityCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(DraftMyActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            //var activity = _entities.Get<Activity>()
            //    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
            //    {
            //        t => t.Tags,
            //    })
            //    .ByUserNameAndNumber(ActivityMode.Draft.AsSentenceFragment(), command.Principal.Identity.Name, command.Number);
            //if (activity == null) return;

            //activity.Values.Title = command.Title;
            //activity.Values.Content = command.Content;
            //activity.Values.StartsOn = command.StartsOn;
            //activity.Values.EndsOn = command.EndsOn;

            //if (command.Tags != null)
            //{
            //    // remove deleted tags
            //    foreach (var tagToDelete in command.Tags.Where(t => t.IsDeleted)
            //        .Select(deletedTag => activity.Tags
            //            .Where(
            //                draftedTag =>
            //                draftedTag.Mode == ActivityMode.Draft &&
            //                draftedTag.Text == deletedTag.Text &&
            //                draftedTag.DomainType == deletedTag.DomainType &&
            //                draftedTag.DomainKey == deletedTag.DomainKey
            //            ).ToArray()
            //        )
            //        .SelectMany(tagsToDelete => tagsToDelete)
            //    )
            //    {
            //        activity.Tags.Remove(tagToDelete);
            //    }

            //    // add new tags
            //    foreach (var tagToAddOrKeep in
            //        from tagToAddOrKeep in command.Tags.Where(t => !t.IsDeleted)
            //        let draftedTag = activity.Tags
            //            .Where(
            //                t =>
            //                t.Mode == ActivityMode.Draft &&
            //                t.Text == tagToAddOrKeep.Text &&
            //                t.DomainType == tagToAddOrKeep.DomainType &&
            //                t.DomainKey == tagToAddOrKeep.DomainKey
            //            ).ToArray()
            //        where !draftedTag.Any()
            //        select tagToAddOrKeep)
            //    {
            //        activity.Tags.Add(new ActivityTag
            //        {
            //            Activity = activity,
            //            Number = activity.Tags.NextNumber(),
            //            Text = tagToAddOrKeep.Text,
            //            DomainType = tagToAddOrKeep.DomainType,
            //            DomainKey = tagToAddOrKeep.DomainKey,
            //            Mode = ActivityMode.Draft
            //        });
            //    }
            //}

            //activity.UpdatedOn = DateTime.UtcNow;

            //_entities.Update(activity);
        }
    }
}
