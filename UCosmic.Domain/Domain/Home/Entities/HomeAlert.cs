
using UCosmic.Domain.Establishments;
namespace UCosmic.Domain.Home
{
    public class HomeAlert : Entity
    {
        public int Id { get; set; }
        public int? EstablishmentId { get; set; }
        public virtual Establishment Establishment { get; protected internal set; }
        public string Text { get; set; }
    }
}
