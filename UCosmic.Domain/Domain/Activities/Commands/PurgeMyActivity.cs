using System;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class PurgeMyActivity
    {
        public IPrincipal Principal { get; set; }
        public int Number { get; set; }
    }

    public class HandlePurgeMyActivityCommand : IHandleCommands<PurgeMyActivity>
    {
        private readonly ICommandEntities _entities;

        public HandlePurgeMyActivityCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(PurgeMyActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            //var activity = _entities.Get<Activity>()
            //    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
            //    {
            //        t => t.Tags
            //    })
            //    .ByUserNameAndNumber(ActivityMode.Draft.AsSentenceFragment(), command.Principal.Identity.Name, command.Number);

            //_entities.Purge(activity);

            //activity = _entities.Get<Activity>()
            //    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
            //    {
            //        t => t.Tags
            //    })
            //    .ByUserNameAndNumber(ActivityMode.Public.AsSentenceFragment(), command.Principal.Identity.Name, command.Number);

            //_entities.Purge(activity);

            //activity = _entities.Get<Activity>()
            //    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
            //    {
            //        t => t.Tags
            //    })
            //    .ByUserNameAndNumber(ActivityMode.AutoSaveDraft.AsSentenceFragment(), command.Principal.Identity.Name, command.Number);

            //_entities.Purge(activity);

            //activity = _entities.Get<Activity>()
            //    .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
            //    {
            //        t => t.Tags
            //    })
            //    .ByUserNameAndNumber(ActivityMode.AutoSavePublic.AsSentenceFragment(), command.Principal.Identity.Name, command.Number);

            //_entities.Purge(activity);
        }
    }
}
