using UCosmic.Domain.Languages;
using UCosmic.Domain.People;

namespace UCosmic.Domain.LanguageExpertises
{
    public class LanguageExpertise : RevisableEntity
    {
        public enum Component
        {
            Speaking,
            Listening,
            Reading,
            Writing,
            NumberOfComponents
        };

        public enum Proficiency
        {
            None,
            Elementary,
            LimitedWorking,
            GeneralProfessional,
            AdvancedProfessional,
            FunctionallyNative
        };

        protected bool Equals(LanguageExpertise other)
        {
            return (LanguageId == other.LanguageId) &&
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
                int hashCode = LanguageId.GetHashCode();
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
            SpeakingProficiency = (int)Proficiency.None;
            ListeningProficiency = (int)Proficiency.None;
            ReadingProficiency = (int)Proficiency.None;
            WritingProficiency = (int)Proficiency.None;
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public virtual Language Language { get; protected internal set; }
        public int LanguageId { get; protected internal set; }
        public string Dialect { get; protected internal set; }
        public string Other { get; protected internal set; }
        public int SpeakingProficiency { get; protected internal set; }
        public int ListeningProficiency { get; protected internal set; }
        public int ReadingProficiency { get; protected internal set; }
        public int WritingProficiency { get; protected internal set; }
    }
}
