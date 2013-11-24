using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Newtonsoft.Json;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class Person : RevisableEntity
    {
        internal const string PhotoPathFormat = "/person-photos/{0}/{1}";

        protected internal Person()
        {
            IsActive = true;
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Affiliations = new Collection<Affiliation>();
            Emails = new Collection<EmailAddress>();
            Messages = new Collection<EmailMessage>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public bool IsActive { get; protected internal set; }
        public bool IsDisplayNameDerived { get; protected internal set; }
        public string DisplayName { get; protected internal set; }
        public string Salutation { get; protected internal set; }
        public string FirstName { get; protected internal set; }
        public string MiddleName { get; protected internal set; }
        public string LastName { get; protected internal set; }
        public string Suffix { get; protected internal set; }
        public string Gender { get; protected internal set; }
        public virtual ExternalFile Photo { get; protected internal set; }
        public virtual ICollection<EmailAddress> Emails { get; protected set; }
        public virtual ICollection<Affiliation> Affiliations { get; protected set; }

        public virtual User User { get; protected internal set; }
        public virtual ICollection<EmailMessage> Messages { get; protected set; }

        public EmailAddress DefaultEmail { get { return Emails.SingleOrDefault(x => x.IsDefault); } }

        /* Deprecated */
        public Affiliation AffiliateWith(Establishment establishment)
        {
            var currentAffiliations = Affiliations.ToList();

            // affiliation may already exist
            var affiliation = currentAffiliations
                .SingleOrDefault(a => a.Establishment.Equals(establishment));
            if (affiliation != null) return affiliation;

            // create affiliation
            affiliation = new Affiliation
            {
                // if person does not already have a default affiliation, this is it
                IsDefault = !currentAffiliations.Any(a => a.IsDefault),
                Establishment = establishment, // affiliate with establishment
                Person = this,

                // for non-institutions, person should not be claiming student, faculty, etc
                IsClaimingEmployee = !establishment.IsInstitution,
            };

            // add & return affiliation
            Affiliations.Add(affiliation);
            return affiliation;
        }
        
        public Affiliation DefaultAffiliation
        {
            get
            {
                if (Affiliations != null)
                {
                    var defaultAffiliation = Affiliations.SingleOrDefault(a => a.IsDefault);
                    if (defaultAffiliation != null) return defaultAffiliation;
                }
                return null;
            }
        }

        /* Deprecated */
        public bool IsAffiliatedWith(Establishment establishment)
        {
            if (Affiliations != null)
            {
                foreach (var affiliation in Affiliations)
                {
                    if (affiliation.EstablishmentId == establishment.RevisionId)
                    {
                        return true;
                    }

                    // check all parents of the establishment
                    if (establishment.Ancestors != null && establishment.Ancestors.Count > 0)
                    {
                        //foreach (var ancestor in establishment.Ancestors.Select(a => a.Ancestor))
                        //{
                        //    if (IsAffiliatedWith(ancestor)) return true;
                        //}
                        if (establishment.Ancestors.Select(a => a.Ancestor).Any(IsAffiliatedWith))
                            return true;
                    }
                }
            }
            return false;
        }

        public override string ToString()
        {
            return DisplayName;
        }
    }

    internal static class PersonSerializer
    {
        internal static string ToJsonAudit(this Person entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                entity.IsActive,
                entity.IsDisplayNameDerived,
                entity.DisplayName,
                entity.Salutation,
                entity.FirstName,
                entity.MiddleName,
                entity.LastName,
                entity.Suffix,
                entity.Gender,

            });
            return state;
        }
    }
}