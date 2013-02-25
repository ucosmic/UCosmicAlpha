using System;
using System.Linq;
using System.Linq.Expressions;

/*
 * Activity Functions
 * -------------------
 * 
 * (New), Save as Draft
 *  Create Activity with Mode = ActivityMode.Draft
 *  Create ActivityValues with Mode = ActivityMode.Draft
 *  Create ActivityTags with Mode = ActivityMode.Draft 
 * 
 * (New), Save as Public
 *  Create Activity with Mode = ActivityMode.Public
 *  Create ActivityValues with Mode = ActivityMode.Public
 *  Create ActivityTags with Mode = ActivityMode.Public
 *  
 * (New), Cancel
 *  Remove AutoSave
 * 
 * (Edit)
 *  Before editing, check for existence of AutoSaveDraft/Public
 *  Activity and if found, set Draft/Public Activity.
 *  
 * (Edit) ActivityMode.Draft, Save As Draft
 *  Set ActivityValues
 *  Removed deleted Tags
 *  Add new Tags
 *  Remove Activity with Mode = AutoSaveDraft
 *  
 * (Edit) ActivityMode.Draft, Cancel
 *  Remove Activity with Mode = AutoSaveDraft
 *  
 * (Edit) ActivityMode.Public, Save As Final
 *  Set ActivityValues
 *  Remove deleted Tags
 *  Add new Tags
 *  Remove Activity with Mode = AutoSavePublic
 * 
 * (Edit) ActivityMode.Draft, Save As Final
 *      Change Mode to Public
 *      Set ActivityValues
 *      Remove deleted Tags
 *      Add new Tags
 *  Remove Activity with Mode = AutoSaveDraft
 * 
 * (Edit) ActivityMode.Public, Save As Draft
 *      Change Mode to Draft
 *      Set ActivityValues
 *      Remove deleted Tags
 *      Add new Tags
 *  Remove Activity with Mode = AutoSavePublic
 *      
 * AutoSavePublic (ActivityMode.Public, Auto save)
 * AutoSaveDraft (ActivityMode.Draft, Auto save)
 *      Set Activity
 *      Set ActivityValues
 *      Set ActivityTags
 *      
 */

namespace UCosmic.Domain.Activities
{
    public class UpdateMyActivity : DraftMyActivity
    {
        public string ModeText { get; set; }
    }

    public class HandleUpdateMyActivityCommand : IHandleCommands<UpdateMyActivity>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateMyActivityCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateMyActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    t => t.Tags,
                })
                .ByUserNameAndNumber(command.ModeText, command.Principal.Identity.Name, command.Number);

            //activity.Mode = command.ModeText.AsEnum<ActivityMode>();
            //activity.Values.Title = command.Title;
            //activity.Values.Content = command.Content;
            //activity.Values.StartsOn = command.StartsOn;
            //activity.Values.EndsOn = command.EndsOn;

            if (command.Tags != null)
            {
                // remove deleted tags
                foreach (var tagToDelete in command.Tags.Where(t => t.IsDeleted)
                    .Select(deletedTag => activity.Tags
                        .Where(
                            tag =>
                            tag.Mode == command.ModeText.AsEnum<ActivityMode>() &&
                            tag.Text == deletedTag.Text &&
                            tag.DomainType == deletedTag.DomainType &&
                            tag.DomainKey == deletedTag.DomainKey
                        ).ToArray()
                    )
                    .SelectMany(tagsToDelete => tagsToDelete)
                )
                {
                    activity.Tags.Remove(tagToDelete);
                }

                // add new tags
                foreach (var tagToAddOrKeep in
                    from tagToAddOrKeep in command.Tags.Where(t => !t.IsDeleted)
                    let tag = activity.Tags
                        .Where(
                            t =>
                            t.Mode == command.ModeText.AsEnum<ActivityMode>() &&
                            t.Text == tagToAddOrKeep.Text &&
                            t.DomainType == tagToAddOrKeep.DomainType &&
                            t.DomainKey == tagToAddOrKeep.DomainKey
                        ).ToArray()
                    where !tag.Any()
                    select tagToAddOrKeep)
                {
                    activity.Tags.Add(new ActivityTag
                    {
                        Activity = activity,
                        Number = activity.Tags.NextNumber(),
                        Text = tagToAddOrKeep.Text,
                        DomainType = tagToAddOrKeep.DomainType,
                        DomainKey = tagToAddOrKeep.DomainKey,
                        Mode = ActivityMode.Public
                    });
                }
            }

            // sync drafted tags with updated tags
            activity.Tags.Clear();
            foreach (var tag in activity.Tags)
            {
                activity.Tags.Add(new ActivityTag
                {
                    Activity = tag.Activity,
                    Number = tag.Number,
                    Text = tag.Text,
                    DomainType = tag.DomainType,
                    DomainKey = tag.DomainKey,
                    Mode = ActivityMode.Draft
                });
            }

            activity.UpdatedOn = DateTime.UtcNow;

            _entities.Update(activity);
        }
    }
}
