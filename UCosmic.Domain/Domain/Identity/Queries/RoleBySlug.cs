using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class RoleBySlug : BaseEntityQuery<Role>, IDefineQuery<Role>
    {
        public RoleBySlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                throw new ArgumentException("Cannot be null or white space", "slug");
            Slug = slug;
        }

        public string Slug { get; private set; }
        internal string RoleName { get { return Slug.Replace("-", " "); } }
    }

    public class HandleRoleBySlugQuery : IHandleQueries<RoleBySlug, Role>
    {
        private readonly IQueryEntities _entities;

        public HandleRoleBySlugQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Role Handle(RoleBySlug query)
        {
            return _entities.Query<Role>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.Name.Equals(query.RoleName, StringComparison.OrdinalIgnoreCase))
            ;
        }
    }
}
