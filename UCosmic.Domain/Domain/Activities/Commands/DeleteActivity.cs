using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Activities
{
    public class DeleteActivity
    {
        public DeleteActivity(IPrincipal principal, int activityId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        internal IDictionary<string, byte[]> DeletedDocuments { get; set; }
        internal bool NoCommit { get; set; }
        internal int OuterActivityId { get; set; }
    }

    public class ValidateDeleteActivityCommand : AbstractValidator<DeleteActivity>
    {
        public ValidateDeleteActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // make sure user owns this activity
            RuleFor(x => x.Principal)
                .MustOwnActivity(queryProcessor, x => x.ActivityId);
        }
    }

    public class HandleDeleteActivityCommand : IHandleCommands<DeleteActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandleDeleteActivityCommand(ICommandEntities entities, IStoreBinaryData binaryData)
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(DeleteActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load the activity along with its documents & alternate copies
            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Documents),
                    x => x.WorkCopy,
                    x => x.Original,
                })
                .SingleOrDefault(x => x.RevisionId == command.ActivityId);
            if (activity == null) return;

            // deleting activity will cascade delete documents, 
            // so they must be removed from the binary store
            command.DeletedDocuments = new Dictionary<string, byte[]>();
            foreach (var path in activity.Values.SelectMany(x => x.Documents.Select(y => y.Path)))
            {
                if (_binaryData.Exists(path))
                {
                    command.DeletedDocuments.Add(path, _binaryData.Get(path));
                    _binaryData.Delete(path);
                }
            }

            // if this activity is a work copy, also delete the original if it is empty
            DeleteActivity deleteOriginal = null;

            // if a work copy exists, delete it too
            DeleteActivity deleteWorkCopy = null;
            
            if (activity.Original != null && activity.Original.RevisionId != command.OuterActivityId && activity.Original.IsEmpty())
            {
                deleteOriginal = new DeleteActivity(command.Principal, activity.Original.RevisionId)
                {
                    NoCommit = true,
                    OuterActivityId = command.ActivityId,
                };
                Handle(deleteOriginal);
            }
            else if (activity.WorkCopy != null && activity.WorkCopy.RevisionId != command.OuterActivityId)
            {
                deleteWorkCopy = new DeleteActivity(command.Principal, activity.WorkCopy.RevisionId)
                {
                    NoCommit = true,
                    OuterActivityId = command.ActivityId,
                };
                Handle(deleteWorkCopy);
            }

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new { command.ActivityId }),
                PreviousState = activity.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(activity);

            try
            {
                // wrap removal in try block
                if (!command.NoCommit) _entities.SaveChanges();
            }
            catch
            {
                // restore binary data when savechanges fails
                foreach (var path in command.DeletedDocuments)
                    _binaryData.Put(path.Key, path.Value, true);

                if (deleteOriginal != null)
                    foreach (var path in deleteOriginal.DeletedDocuments)
                        _binaryData.Put(path.Key, path.Value, true);

                if (deleteWorkCopy != null)
                    foreach (var path in deleteWorkCopy.DeletedDocuments)
                        _binaryData.Put(path.Key, path.Value, true);
            }
        }
    }
}
