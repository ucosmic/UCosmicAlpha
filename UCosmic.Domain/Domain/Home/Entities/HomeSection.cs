using UCosmic.Domain.Files;
using UCosmic.Domain.Establishments;
using System.Collections.Generic;
using System.Collections.ObjectModel;
namespace UCosmic.Domain.Home
{
    public class HomeSection : Entity
    {

        protected internal HomeSection()
        {
            Links = new Collection<HomeLink>();
        }
        internal const string PhotoPathFormat = "/home-photos/{0}/{1}";
        public int Id { get; set; }
        public int? EstablishmentId { get; set; }
        public virtual Establishment Establishment { get; protected internal set; }
        public virtual ExternalFile Photo { get; protected internal set; }
        //public HomeLink[] Links { get; set; }
        public virtual ICollection<HomeLink> Links { get; protected set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
