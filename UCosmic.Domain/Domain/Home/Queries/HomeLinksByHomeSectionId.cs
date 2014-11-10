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

            IQueryable<HomeLink> homeLinks = _entities.Query<HomeLink>()
                                                             .Where(a => a.HomeSectionId == query.HomeSectionId);

            return homeLinks.ToArray();
        }
    }
}
