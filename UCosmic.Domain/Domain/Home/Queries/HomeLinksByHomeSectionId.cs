using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class HomeLinksByHomeSectionId : BaseEntitiesQuery<HomeLink>, IDefineQuery<HomeLink[]>
    {
        public HomeLinksByHomeSectionId(IPrincipal principal, int homeSectionId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            HomeSectionId = homeSectionId;
        }

        public IPrincipal Principal { get; private set; }
        public int HomeSectionId { get; private set; }
    }

    public class HandleHomeLinksByHomeSectionIdQuery : IHandleQueries<HomeLinksByHomeSectionId, HomeLink[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleHomeLinksByHomeSectionIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public HomeLink[] Handle(HomeLinksByHomeSectionId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // when agreement id is not known or valid, return user's default affiliation
            //if (!query.HomeSectionId.HasValue || query.HomeSectionId == 0)
            //{
            //    var noHomeLinks = new HomeLink[0];

            //    // return nothing when there is no username
            //    if (string.IsNullOrWhiteSpace(query.Principal.Identity.Name)) return noHomeLinks;

            //    // return nothing when user is not an agreement manager or supervisor
            //    //if (!query.Principal.IsInAnyRole(RoleName.HomeSectionManagers)) return noHomeLinks;

            //    var user = _queryProcessor.Execute(new UserByName(query.Principal.Identity.Name)
            //    {
            //        EagerLoad = new Expression<Func<User, object>>[]
            //        {
            //            x => x.Tenant,
            //        }
            //    });
            //    if (user == null) return noHomeLinks;

            //    var homeLink = new HomeLink
            //    {
            //        IsOwner = true,
            //        HomeSection = new HomeSection(),
            //        Establishment = user.Tenant,
            //    };
            //    return new[] { homeLink };
            //}

            IQueryable<HomeLink> homeLinks = _entities.Query<HomeLink>()
                                                             .Where(a => a.HomeSectionId == query.HomeSectionId);

            //var homeLinks = _entities.Query<HomeLink>()
            //    .EagerLoad(_entities, query.EagerLoad)
            //    .ById(query.HomeSectionId)
            //    .VisibleTo(query.Principal, _queryProcessor)
            //    .OrderBy(query.OrderBy)
            //;

            return homeLinks.ToArray();
        }
    }
}
