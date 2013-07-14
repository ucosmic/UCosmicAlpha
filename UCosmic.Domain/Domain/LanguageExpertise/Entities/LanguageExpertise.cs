using UCosmic.Domain.Languages;
using UCosmic.Domain.People;

namespace UCosmic.Domain.LanguageExpertise
{
    public class LanguageExpertise : RevisableEntity
    {
        protected bool Equals(LanguageExpertise other)
        {
            return (LanguageId.HasValue == other.LanguageId.HasValue) &&
                   ((LanguageId.HasValue && other.LanguageId.HasValue && (LanguageId.Value == other.LanguageId.Value)) ||
                   (!LanguageId.HasValue && !other.LanguageId.HasValue)) &&
                   string.Equals(Dialect, other.Dialect) &&
                   string.Equals(Other, other.Other) &&
                   SpeakingProficiency == other.SpeakingProficiency &&
                   ListeningProficiency == other.ListeningProficiency &&
                   ReadingProficiency == other.ReadingProficiency &&
                   WritingProficiency == other.WritingProficiency;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((LanguageExpertise)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = LanguageId.HasValue ? LanguageId.Value.GetHashCode() : 0;
                hashCode = (hashCode * 397) ^ (Dialect != null ? Dialect.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Other != null ? Other.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ SpeakingProficiency.GetHashCode();
                hashCode = (hashCode * 397) ^ ListeningProficiency.GetHashCode();
                hashCode = (hashCode * 397) ^ ReadingProficiency.GetHashCode();
                hashCode = (hashCode * 397) ^ WritingProficiency.GetHashCode();
                return hashCode;
            }
        }

        public LanguageExpertise()
        {
            LanguageId = null;
            SpeakingProficiency = 0;
            ListeningProficiency = 0;
            ReadingProficiency = 0;
            WritingProficiency = 0;
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public virtual Language Language { get; protected internal set; }
        public int? LanguageId { get; protected internal set; } // If null, Other must not be null/empty
        public string Other { get; protected internal set; }
        public string Dialect { get; protected internal set; }
        public int SpeakingProficiency { get; protected internal set; }
        public int ListeningProficiency { get; protected internal set; }
        public int ReadingProficiency { get; protected internal set; }
        public int WritingProficiency { get; protected internal set; }
    }
}
