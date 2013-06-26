using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Newtonsoft.Json;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class User : RevisableEntity
    {
        protected internal User()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Grants = new Collection<RoleGrant>();
            SubjectNameIdentifiers = new Collection<SubjectNameIdentifier>();
            EduPersonScopedAffiliations = new Collection<EduPersonScopedAffiliation>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int? TenantId { get; protected internal set; }
        public virtual Establishment Tenant { get; set; }

        public virtual Person Person { get; protected internal set; }
        public string Name { get; protected internal set; }
        public bool IsRegistered { get; protected internal set; }

        public string EduPersonTargetedId { get; protected internal set; }
        public virtual ICollection<EduPersonScopedAffiliation> EduPersonScopedAffiliations { get; protected set; }
        public virtual ICollection<SubjectNameIdentifier> SubjectNameIdentifiers { get; protected set; }

        public virtual ICollection<RoleGrant> Grants { get; protected internal set; }
        public bool IsInRole(string roleName)
        {
            return Grants.SingleOrDefault(x => x.Role.Name == roleName) != null;
        }

        public override string ToString()
        {
            return Name;
        }
    }


    internal static class UserSerializer
    {
        internal static string ToJsonAudit(this User entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                PersonId = entity.Person.RevisionId,
                entity.EduPersonTargetedId,
                entity.Name,
                entity.IsRegistered,
            });
            return state;
        }
    }
}