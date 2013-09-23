using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class ActivityById : BaseEntityQuery<Activity>, IDefineQuery<Activity>
    {
        public ActivityById(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        internal ActivityById(int activityId)
        {
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
    }

    public class HandleActivityByIdQuery : IHandleQueries<ActivityById, Activity>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleActivityByIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public Activity Handle(ActivityById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
            ;

            // when principal is provided, make sure this activity is visible
            if (query.Principal != null)
            {
                var publicText = ActivityMode.Public.AsSentenceFragment();

                // allow module managers to see their tenancy's activities regardless of whether it is published
                if (query.Principal.IsInRole(RoleName.EmployeeProfileManager))
                {
                    var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));

                    queryable = queryable.Where(x => // restrict to activities where
                        (x.ModeText == publicText && x.Original == null) // the activity is published
                        ||  // or
                        (   // the activity is not published but the person who owns it is under user's tenancy
                            x.Person.Affiliations.Count(y => y.IsDefault) == 1 &&
                            ownedTenantIds.Contains(x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId)
                        )
                    );
                }

                // allow activity owners to see their own activities
                else if (query.Principal.Identity.IsAuthenticated)
                {
                    queryable = queryable.Where(x => // restrict to activities where
                        (x.ModeText == publicText && x.Original == null) // the activity is published
                        ||  // or
                        (   // the activity is owned by the user
                            x.Person.User != null &&
                            x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase)
                        )
                    );
                }

                // everyone else can only see public activities
                else
                {
                    queryable = queryable.Published();
                }
            }

            var result = queryable.ById(query.ActivityId);
            return result;
        }
    }
}
