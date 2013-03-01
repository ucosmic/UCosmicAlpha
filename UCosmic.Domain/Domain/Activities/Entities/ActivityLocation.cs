using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityLocation : RevisableEntity
    {
        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual Place Place { get; set; }
        public int PlaceId { get; set; }
    }
}
