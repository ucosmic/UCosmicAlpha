using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
namespace UCosmic.Web.Mvc.Models
{
    public class AffiliationViewModel
    {
        public int PersonId { get; set; }
        public virtual Person Person { get; set; }

        public int EstablishmentId { get; set; }
        public virtual Establishment Establishment { get; set; }

        public string JobTitles { get; set; }
    }
}